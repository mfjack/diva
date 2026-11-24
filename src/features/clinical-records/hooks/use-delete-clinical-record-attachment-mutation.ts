import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { deleteClinicalRecordAttachment } from "../actions";
import type { ClinicalRecordAttachmentId, ClinicalRecordId } from "../types";

type DeleteClinicalRecordAttachmentVariables = {
  recordId: ClinicalRecordId;
  attachmentId: ClinicalRecordAttachmentId;
};

export function getDeleteClinicalRecordAttachmentMutationKey() {
  return ["clinical-records", "delete-attachment"] as const;
}

export function useDeleteClinicalRecordAttachmentMutation() {
  return useMutation({
    mutationKey: getDeleteClinicalRecordAttachmentMutationKey(),
    mutationFn: async ({
      recordId,
      attachmentId,
    }: DeleteClinicalRecordAttachmentVariables) =>
      unwrapActionResult(
        await deleteClinicalRecordAttachment(recordId, attachmentId),
      ),
  });
}
