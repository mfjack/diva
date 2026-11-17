import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { deleteExpenseAttachment } from "../actions";
import type { ExpenseAttachmentId, ExpenseId } from "../types";

type DeleteExpenseAttachmentVariables = {
  expenseId: ExpenseId;
  attachmentId: ExpenseAttachmentId;
};

export function getDeleteExpenseAttachmentMutationKey() {
  return ["expenses", "delete-attachment"] as const;
}

export function useDeleteExpenseAttachmentMutation() {
  return useMutation({
    mutationKey: getDeleteExpenseAttachmentMutationKey(),
    mutationFn: async ({
      expenseId,
      attachmentId,
    }: DeleteExpenseAttachmentVariables) =>
      unwrapActionResult(
        await deleteExpenseAttachment(expenseId, attachmentId),
      ),
  });
}
