import type { Attachment } from "@/lib/attachments";
import type { Brand } from "@/lib/brand";
import type { Cents } from "@/lib/money";

export const EXPENSE_CATEGORIES = [
  "supervision",
  "education",
  "materials",
  "office",
  "software",
  "taxes",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_RECURRENCES = [
  "once",
  "weekly",
  "monthly",
  "installments",
] as const;

export type ExpenseRecurrence = (typeof EXPENSE_RECURRENCES)[number];

export type ExpenseId = Brand<string, "ExpenseId">;

export type ExpenseAttachmentId = Brand<string, "ExpenseAttachmentId">;

export type ExpenseAttachment = Attachment & { id: ExpenseAttachmentId };

export type Expense = {
  id: ExpenseId;
  description: string;
  category: ExpenseCategory;
  amountCents: Cents;
  recurrence: ExpenseRecurrence;
  startsOn: string;
  endsOn: string | null;
  installmentCount: number | null;
  notes: string | null;
  attachments: ExpenseAttachment[];
  createdAt: string;
};

export type ExpensePaymentId = Brand<string, "ExpensePaymentId">;

export type ExpensePayment = {
  id: ExpensePaymentId;
  expenseId: ExpenseId;
  dueOn: string;
  paidOn: string;
};

export type ExpenseOccurrenceStatus = "pending" | "overdue" | "paid";

export type ExpenseOccurrence = {
  expense: Expense;
  dueOn: string;
  paidOn: string | null;
  installmentNumber: number | null;
  status: ExpenseOccurrenceStatus;
};
