import type { UserId } from "@/features/auth/types";
import type { ClinicalRecordAttachmentId, ClinicalRecordId } from "./types";

export const CLINICAL_RECORD_ATTACHMENTS_BUCKET = "clinical-record-attachments";

export const ENCRYPTED_FILE_CONTENT_TYPE = "application/octet-stream";

export function getClinicalRecordAttachmentPath(
  psychologistId: UserId,
  recordId: ClinicalRecordId,
  attachmentId: ClinicalRecordAttachmentId,
): string {
  return `${psychologistId}/${recordId}/${attachmentId}`;
}
