"use server";

import { revalidatePath } from "next/cache";
import {
  deleteAttachment,
  removeAttachmentFiles,
  storeAttachment,
} from "@/features/attachments/storage";
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
import {
  ATTACHMENT_UPLOAD_MESSAGES,
  readAttachmentUpload,
} from "@/lib/attachment-upload";
import { toDateKey } from "@/lib/dates";
import { toCents } from "@/lib/money";
import { ROUTES } from "@/lib/routes";
import { emptyToNull } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import { EXPENSE_ACTION_MESSAGES } from "./messages";
import { getExpense, hasExpensePayment } from "./queries";
import { canEndRecurrence, isOccurrenceOf } from "./recurrence";
import {
  type ExpenseInput,
  type ExpenseOccurrenceInput,
  expenseOccurrenceSchema,
  expenseSchema,
} from "./schemas";
import type { Expense, ExpenseAttachmentId, ExpenseId } from "./types";

function findAuthorizedExpense(expenseId: string) {
  return findAuthorizedEntity(
    expenseId,
    getExpense,
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
  description,
  category,
  recurrence,
  startsOn,
}: ExpenseInput) {
  return {
    description,
    category,
    recurrence,
    starts_on: startsOn,
    amount_cents: toCents(amount),
    installment_count:
      recurrence === "installments" ? (installmentCount ?? null) : null,
    notes: emptyToNull(notes),
  };
}

async function deleteOrphanPayments(expense: Expense): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expense_payments")
    .select("id, due_on")
    .eq("expense_id", expense.id);
  const orphanIds = (data ?? [])
    .filter(({ due_on }) => !isOccurrenceOf(expense, due_on))
    .map(({ id }) => id);
  if (orphanIds.length > 0) {
    await supabase.from("expense_payments").delete().in("id", orphanIds);
  }
}

export async function saveExpense(
  expenseId: ExpenseId | null,
  input: ExpenseInput,
): Promise<ActionResult<{ expenseId: ExpenseId }>> {
  const parsedInput = expenseSchema.safeParse(input);
  const supabase = await createClient();

  if (expenseId === null) {
    const psychologist = await getAuthorizedPsychologist();
    if (!psychologist) return actionFailure(UNAUTHORIZED_MESSAGE);
    if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        ...toExpenseFields(parsedInput.data),
        psychologist_id: psychologist.id,
      })
      .select("id")
      .single();
    if (error) return actionFailure(EXPENSE_ACTION_MESSAGES.saveFailed);
    revalidateFinance();
    return actionSuccess({ expenseId: data.id as ExpenseId });
  }

  const lookup = await findAuthorizedExpense(expenseId);
  if (!lookup.isFound) return lookup.failure;
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const fields = toExpenseFields(parsedInput.data);
  const endsOn =
    lookup.entity.endsOn !== null && lookup.entity.endsOn >= fields.starts_on
      ? lookup.entity.endsOn
      : null;
  const { error } = await supabase
    .from("expenses")
    .update({ ...fields, ends_on: endsOn })
    .eq("id", lookup.entity.id);
  if (error) return actionFailure(EXPENSE_ACTION_MESSAGES.saveFailed);

  await deleteOrphanPayments({
    ...lookup.entity,
    recurrence: fields.recurrence,
    startsOn: fields.starts_on,
    endsOn,
    installmentCount: fields.installment_count,
  });
  revalidateFinance();
  return actionSuccess({ expenseId: lookup.entity.id });
}

export async function uploadExpenseAttachment(
  expenseId: ExpenseId,
  formData: FormData,
): Promise<ActionResult> {
  const lookup = await findAuthorizedExpense(expenseId);
  if (!lookup.isFound) return lookup.failure;
  const upload = await readAttachmentUpload(
    formData,
    lookup.entity.attachments.length,
  );
  if (!upload.isValid) return actionFailure(upload.message);

  const attachmentId = await storeAttachment({
    store: "expense",
    psychologistId: lookup.psychologist.id,
    itemId: lookup.entity.id,
    upload,
    insertRow: (supabase, fields) =>
      supabase
        .from("expense_attachments")
        .insert({ ...fields, expense_id: lookup.entity.id }),
  });
  if (!attachmentId) {
    return actionFailure(ATTACHMENT_UPLOAD_MESSAGES.uploadFailed);
  }
  revalidateFinance();
  return actionSuccess();
}

export async function deleteExpenseAttachment(
  expenseId: ExpenseId,
  attachmentId: ExpenseAttachmentId,
): Promise<ActionResult> {
  const lookup = await findAuthorizedExpense(expenseId);
  if (!lookup.isFound) return lookup.failure;
  const result = await deleteAttachment({
    store: "expense",
    attachmentId,
    failureMessage: EXPENSE_ACTION_MESSAGES.saveFailed,
    deleteRow: (supabase, parsedAttachmentId) =>
      supabase
        .from("expense_attachments")
        .delete()
        .eq("id", parsedAttachmentId)
        .eq("expense_id", lookup.entity.id)
        .select("storage_path"),
  });
  if (result.status === "success") revalidateFinance();
  return result;
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
  if (await hasExpensePayment(lookup.entity.id, dueOn)) {
    return actionFailure(EXPENSE_ACTION_MESSAGES.alreadyPaid);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("expense_payments").insert({
    expense_id: lookup.entity.id,
    psychologist_id: lookup.psychologist.id,
    due_on: dueOn,
    paid_on: toDateKey(new Date()),
  });
  if (error) return actionFailure(EXPENSE_ACTION_MESSAGES.alreadyPaid);

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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_payments")
    .delete()
    .eq("expense_id", lookup.entity.id)
    .eq("due_on", dueOn)
    .select("id");
  if (error) return actionFailure(EXPENSE_ACTION_MESSAGES.saveFailed);
  if (data.length === 0) return actionFailure(EXPENSE_ACTION_MESSAGES.notPaid);

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

  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({ ends_on: todayKey })
    .eq("id", lookup.entity.id);
  if (error) return actionFailure(EXPENSE_ACTION_MESSAGES.saveFailed);

  revalidateFinance();
  return actionSuccess();
}

export async function deleteExpense(
  expenseId: ExpenseId,
): Promise<ActionResult> {
  const lookup = await findAuthorizedExpense(expenseId);
  if (!lookup.isFound) return lookup.failure;

  const supabase = await createClient();
  const { data: attachments } = await supabase
    .from("expense_attachments")
    .select("storage_path")
    .eq("expense_id", lookup.entity.id);
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", lookup.entity.id);
  if (error) return actionFailure(EXPENSE_ACTION_MESSAGES.saveFailed);

  await removeAttachmentFiles(
    "expense",
    (attachments ?? []).map(({ storage_path }) => storage_path),
  );
  revalidateFinance();
  return actionSuccess();
}
