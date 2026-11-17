import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { uploadExpenseAttachment } from "../actions";
import type { ExpenseId } from "../types";

type UploadExpenseAttachmentVariables = {
  expenseId: ExpenseId;
  file: File;
};

export function getUploadExpenseAttachmentMutationKey() {
  return ["expenses", "upload-attachment"] as const;
}

export function useUploadExpenseAttachmentMutation() {
  return useMutation({
    mutationKey: getUploadExpenseAttachmentMutationKey(),
    mutationFn: async ({
      expenseId,
      file,
    }: UploadExpenseAttachmentVariables) => {
      const formData = new FormData();
      formData.set("file", file);
      return unwrapActionResult(
        await uploadExpenseAttachment(expenseId, formData),
      );
    },
  });
}
