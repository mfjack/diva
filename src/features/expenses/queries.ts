import "server-only";

import type { QueryData } from "@supabase/supabase-js";
import { z } from "zod";
import { getCurrentUser } from "@/features/auth/queries";
import { toDateKey } from "@/lib/dates";
import type { Cents } from "@/lib/money";
import type { MonthRange } from "@/lib/months";
import { assertNoDatabaseError } from "@/lib/supabase/errors";
import { createClient, type SupabaseServerClient } from "@/lib/supabase/server";
import {
  buildMonthOccurrences,
  type ExpenseMonthGroups,
  groupMonthOccurrences,
} from "./occurrences";
import type {
  Expense,
  ExpenseAttachment,
  ExpenseAttachmentId,
  ExpenseId,
  ExpensePayment,
  ExpensePaymentId,
} from "./types";

const EXPENSE_COLUMNS = `
  id,
  description,
  category,
  amount_cents,
  recurrence,
  starts_on,
  ends_on,
  installment_count,
  notes,
  created_at,
  expense_attachments (id, file_name, content_type, size_bytes, created_at)
`;

const entityIdSchema = z.uuid();

function selectExpenses(supabase: SupabaseServerClient) {
  return supabase.from("expenses").select(EXPENSE_COLUMNS);
}

type ExpenseRow = QueryData<ReturnType<typeof selectExpenses>>[number];

type AttachmentRow = ExpenseRow["expense_attachments"][number];

function toAttachment(row: AttachmentRow): ExpenseAttachment {
  return {
    id: row.id as ExpenseAttachmentId,
    fileName: row.file_name,
    contentType: row.content_type as ExpenseAttachment["contentType"],
    sizeBytes: row.size_bytes,
    uploadedAt: row.created_at,
  };
}

function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id as ExpenseId,
    description: row.description,
    category: row.category,
    amountCents: row.amount_cents as Cents,
    recurrence: row.recurrence,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    installmentCount: row.installment_count,
    notes: row.notes,
    attachments: row.expense_attachments
      .map(toAttachment)
      .sort((first, second) =>
        first.uploadedAt.localeCompare(second.uploadedAt),
      ),
    createdAt: row.created_at,
  };
}

export async function getMonthExpenses(
  range: MonthRange,
): Promise<ExpenseMonthGroups> {
  const emptyGroups = groupMonthOccurrences([]);
  if (!(await getCurrentUser())) return emptyGroups;

  const supabase = await createClient();
  const [expensesResult, paymentsResult] = await Promise.all([
    selectExpenses(supabase)
      .lte("starts_on", range.endKey)
      .or(`ends_on.is.null,ends_on.gte.${range.startKey}`),
    supabase
      .from("expense_payments")
      .select("id, expense_id, due_on, paid_on")
      .gte("due_on", range.startKey)
      .lte("due_on", range.endKey),
  ]);
  assertNoDatabaseError(expensesResult.error);
  assertNoDatabaseError(paymentsResult.error);

  const payments: ExpensePayment[] = (paymentsResult.data ?? []).map(
    (payment) => ({
      id: payment.id as ExpensePaymentId,
      expenseId: payment.expense_id as ExpenseId,
      dueOn: payment.due_on,
      paidOn: payment.paid_on,
    }),
  );
  return groupMonthOccurrences(
    buildMonthOccurrences(
      (expensesResult.data ?? []).map(toExpense),
      payments,
      range,
      toDateKey(new Date()),
    ),
  );
}

export async function getExpense(expenseId: string): Promise<Expense | null> {
  const parsedId = entityIdSchema.safeParse(expenseId);
  if (!parsedId.success || !(await getCurrentUser())) return null;
  const supabase = await createClient();
  const { data, error } = await selectExpenses(supabase)
    .eq("id", parsedId.data)
    .maybeSingle();
  assertNoDatabaseError(error);
  return data ? toExpense(data) : null;
}

export async function hasExpensePayment(
  expenseId: ExpenseId,
  dueOn: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("expense_payments")
    .select("id", { count: "exact", head: true })
    .eq("expense_id", expenseId)
    .eq("due_on", dueOn);
  assertNoDatabaseError(error);
  return (count ?? 0) > 0;
}

export async function getExpenseAttachmentFile(attachmentId: string): Promise<{
  attachment: ExpenseAttachment;
  storagePath: string;
} | null> {
  const parsedId = entityIdSchema.safeParse(attachmentId);
  if (!parsedId.success || !(await getCurrentUser())) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_attachments")
    .select("id, file_name, content_type, size_bytes, created_at, storage_path")
    .eq("id", parsedId.data)
    .maybeSingle();
  assertNoDatabaseError(error);
  if (!data) return null;
  return { attachment: toAttachment(data), storagePath: data.storage_path };
}
