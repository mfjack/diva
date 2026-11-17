import type { UserId } from "@/features/auth/types";
import type { ExpenseAttachmentId, ExpenseId } from "./types";

export const EXPENSE_ATTACHMENTS_BUCKET = "expense-attachments";

export function getExpenseAttachmentPath(
  psychologistId: UserId,
  expenseId: ExpenseId,
  attachmentId: ExpenseAttachmentId,
): string {
  return `${psychologistId}/${expenseId}/${attachmentId}`;
}
