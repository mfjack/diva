import type { UserId } from "@/features/auth/types";
import type { StudyNoteAttachmentId, StudyNoteId } from "./types";

export const STUDY_NOTE_ATTACHMENTS_BUCKET = "study-note-attachments";

export function getStudyNoteAttachmentPath(
  psychologistId: UserId,
  noteId: StudyNoteId,
  attachmentId: StudyNoteAttachmentId,
): string {
  return `${psychologistId}/${noteId}/${attachmentId}`;
}
