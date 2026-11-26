import { type Attachment, isAttachmentContentType } from "@/lib/attachments";

export const ATTACHMENT_COLUMNS =
  "id, file_name, content_type, size_bytes, created_at";

type AttachmentRow = {
  id: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
};

export function toAttachment<TAttachmentId extends string>(
  row: AttachmentRow,
): Attachment & { id: TAttachmentId } {
  return {
    id: row.id as TAttachmentId,
    fileName: row.file_name,
    contentType: isAttachmentContentType(row.content_type)
      ? row.content_type
      : "application/pdf",
    sizeBytes: row.size_bytes,
    uploadedAt: row.created_at,
  };
}

export function sortAttachments<TAttachment extends Attachment>(
  attachments: TAttachment[],
): TAttachment[] {
  return attachments.sort((first, second) =>
    first.uploadedAt.localeCompare(second.uploadedAt),
  );
}
