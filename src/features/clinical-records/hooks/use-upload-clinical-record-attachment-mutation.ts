import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { uploadClinicalRecordAttachment } from "../actions";
import type { ClinicalRecordId } from "../types";

type UploadClinicalRecordAttachmentVariables = {
  recordId: ClinicalRecordId;
  file: File;
};

export function getUploadClinicalRecordAttachmentMutationKey() {
  return ["clinical-records", "upload-attachment"] as const;
}

export function useUploadClinicalRecordAttachmentMutation() {
  return useMutation({
    mutationKey: getUploadClinicalRecordAttachmentMutationKey(),
    mutationFn: async ({
      recordId,
      file,
    }: UploadClinicalRecordAttachmentVariables) => {
      const formData = new FormData();
      formData.set("file", file);
      return unwrapActionResult(
        await uploadClinicalRecordAttachment(recordId, formData),
      );
    },
  });
}
