"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { findAuthorizedEntity } from "@/features/auth/authorized-entity";
import {
  INVALID_FORM_MESSAGE,
  UNAUTHORIZED_MESSAGE,
} from "@/features/auth/errors";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { toDateKey } from "@/lib/dates";
import { toCents } from "@/lib/money";
import { ROUTES } from "@/lib/routes";
import { emptyToNull } from "@/lib/strings";
import {
  deleteMockExpenseFile,
  writeMockExpenseFile,
} from "@/mocks/expense-files";
import {
  deleteMockExpense,
  deleteMockExpensePayments,
  findMockExpense,
  findMockExpensePayment,
  insertMockExpense,
  insertMockExpensePayment,
  updateMockExpense,
} from "@/mocks/expenses";
import {
  detectAttachmentType,
  getAttachmentSizeError,
  MAX_ATTACHMENTS_PER_EXPENSE,
  sanitizeAttachmentName,
} from "./attachments";
import { EXPENSE_ACTION_MESSAGES } from "./messages";
import { canEndRecurrence, isOccurrenceOf } from "./recurrence";
import {
  type ExpenseInput,
  type ExpenseOccurrenceInput,
  expenseOccurrenceSchema,
  expenseSchema,
} from "./schemas";
import type {
  Expense,
  ExpenseAttachmentId,
  ExpenseId,
  ExpensePaymentId,
} from "./types";

const attachmentIdSchema = z.string().min(1);

function findAuthorizedExpense(expenseId: string) {
  return findAuthorizedEntity(
    expenseId,
    findMockExpense,
    EXPENSE_ACTION_MESSAGES.notFound,
  );
}

function revalidateFinance(): void {
  revalidatePath(ROUTES.psychologist.finance);
}

function toExpenseFields({
  amount,
  notes,
  installmentCount,
  ...input
}: ExpenseInput) {
  return {
    ...input,
    amountCents: toCents(amount),
    installmentCount:
      input.recurrence === "installments" ? (installmentCount ?? null) : null,
    notes: emptyToNull(notes),
  };
}

function createExpenseFromInput(input: ExpenseInput): ExpenseId {
  const expenseId = crypto.randomUUID() as ExpenseId;
  insertMockExpense({
    ...toExpenseFields(input),
    id: expenseId,
    endsOn: null,
    attachments: [],
    createdAt: new Date().toISOString(),
  });
  return expenseId;
}

function updateExpenseFromInput(expense: Expense, input: ExpenseInput): void {
  const fields = toExpenseFields(input);
  const updatedExpense: Expense = {
    ...expense,
    ...fields,
    endsOn:
      expense.endsOn !== null && expense.endsOn >= fields.startsOn
        ? expense.endsOn
        : null,
  };
  updateMockExpense(updatedExpense.id, updatedExpense);
  deleteMockExpensePayments(
    (payment) =>
      payment.expenseId === updatedExpense.id &&
      !isOccurrenceOf(updatedExpense, payment.dueOn),
  );
}

export async function saveExpense(
  expenseId: ExpenseId | null,
  input: ExpenseInput,
): Promise<ActionResult<{ expenseId: ExpenseId }>> {
  const parsedInput = expenseSchema.safeParse(input);
  if (expenseId === null) {
    if (!(await getAuthorizedPsychologist())) {
      return actionFailure(UNAUTHORIZED_MESSAGE);
    }
    if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);
    const createdId = createExpenseFromInput(parsedInput.data);
    revalidateFinance();
    return actionSuccess({ expenseId: createdId });
  }
  const lookup = await findAuthorizedExpense(expenseId);
  if (!lookup.isFound) return lookup.failure;
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);
  updateExpenseFromInput(lookup.entity, parsedInput.data);
  revalidateFinance();
  return actionSuccess({ expenseId: lookup.entity.id });
}

export async function uploadExpenseAttachment(
  expenseId: ExpenseId,
  formData: FormData,
): Promise<ActionResult> {
  const lookup = await findAuthorizedExpense(expenseId);
  if (!lookup.isFound) return lookup.failure;
  const file = formData.get("file");
  if (!(file instanceof File)) return actionFailure(INVALID_FORM_MESSAGE);
  if (lookup.entity.attachments.length >= MAX_ATTACHMENTS_PER_EXPENSE) {
    return actionFailure(EXPENSE_ACTION_MESSAGES.tooManyAttachments);
  }
  const sizeError = getAttachmentSizeError(file.size);
  if (sizeError) return actionFailure(sizeError);

  const content = new Uint8Array(await file.arrayBuffer());
  const contentType = detectAttachmentType(content);
  if (!contentType) {
    return actionFailure(EXPENSE_ACTION_MESSAGES.unsupportedAttachment);
  }

  const attachment = {
    id: crypto.randomUUID() as ExpenseAttachmentId,
    fileName: sanitizeAttachmentName(file.name),
    contentType,
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
  };
  await writeMockExpenseFile(attachment.id, content);
  updateMockExpense(lookup.entity.id, {
    attachments: [...lookup.entity.attachments, attachment],
  });
  revalidateFinance();
  return actionSuccess();
}

export async function deleteExpenseAttachment(
  expenseId: ExpenseId,
  attachmentId: ExpenseAttachmentId,
): Promise<ActionResult> {
  const lookup = await findAuthorizedExpense(expenseId);
  if (!lookup.isFound) return lookup.failure;
  const parsedAttachmentId = attachmentIdSchema.safeParse(attachmentId);
  if (!parsedAttachmentId.success) return actionFailure(INVALID_FORM_MESSAGE);
  if (!lookup.entity.attachments.some(({ id }) => id === attachmentId)) {
    return actionFailure(EXPENSE_ACTION_MESSAGES.attachmentNotFound);
  }

  await deleteMockExpenseFile(attachmentId);
  updateMockExpense(lookup.entity.id, {
    attachments: lookup.entity.attachments.filter(
      ({ id }) => id !== attachmentId,
    ),
  });
  revalidateFinance();
  return actionSuccess();
}

export async function markExpenseOccurrencePaid(
  input: ExpenseOccurrenceInput,
): Promise<ActionResult> {
  const parsedInput = expenseOccurrenceSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);
  const { expenseId, dueOn } = parsedInput.data;
  const lookup = await findAuthorizedExpense(expenseId);
  if (!lookup.isFound) return lookup.failure;

  if (!isOccurrenceOf(lookup.entity, dueOn)) {
    return actionFailure(EXPENSE_ACTION_MESSAGES.occurrenceNotFound);
  }
  if (findMockExpensePayment(expenseId, dueOn)) {
    return actionFailure(EXPENSE_ACTION_MESSAGES.alreadyPaid);
  }

  insertMockExpensePayment({
    id: crypto.randomUUID() as ExpensePaymentId,
    expenseId: lookup.entity.id,
    dueOn,
    paidOn: toDateKey(new Date()),
  });
  revalidateFinance();
  return actionSuccess();
}

export async function cancelExpenseOccurrencePayment(
  input: ExpenseOccurrenceInput,
): Promise<ActionResult> {
  const parsedInput = expenseOccurrenceSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);
  const { expenseId, dueOn } = parsedInput.data;
  const lookup = await findAuthorizedExpense(expenseId);
  if (!lookup.isFound) return lookup.failure;

  if (!findMockExpensePayment(expenseId, dueOn)) {
    return actionFailure(EXPENSE_ACTION_MESSAGES.notPaid);
  }

  deleteMockExpensePayments(
    (payment) => payment.expenseId === expenseId && payment.dueOn === dueOn,
  );
  revalidateFinance();
  return actionSuccess();
}

export async function endExpenseRecurrence(
  expenseId: ExpenseId,
): Promise<ActionResult> {
  const lookup = await findAuthorizedExpense(expenseId);
  if (!lookup.isFound) return lookup.failure;

  const todayKey = toDateKey(new Date());
  if (!canEndRecurrence(lookup.entity, todayKey)) {
    return actionFailure(EXPENSE_ACTION_MESSAGES.cannotEnd);
  }

  updateMockExpense(lookup.entity.id, { endsOn: todayKey });
  revalidateFinance();
  return actionSuccess();
}

export async function deleteExpense(
  expenseId: ExpenseId,
): Promise<ActionResult> {
  const lookup = await findAuthorizedExpense(expenseId);
  if (!lookup.isFound) return lookup.failure;

  await Promise.all(
    lookup.entity.attachments.map(({ id }) => deleteMockExpenseFile(id)),
  );
  deleteMockExpense(lookup.entity.id);
  revalidateFinance();
  return actionSuccess();
}
