import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { deleteStudyNoteAttachment } from "../actions";
import type { StudyNoteAttachmentId, StudyNoteId } from "../types";

type DeleteStudyNoteAttachmentVariables = {
  noteId: StudyNoteId;
  attachmentId: StudyNoteAttachmentId;
};

export function getDeleteStudyNoteAttachmentMutationKey() {
  return ["studies", "delete-attachment"] as const;
}

export function useDeleteStudyNoteAttachmentMutation() {
  return useMutation({
    mutationKey: getDeleteStudyNoteAttachmentMutationKey(),
    mutationFn: async ({
      noteId,
      attachmentId,
    }: DeleteStudyNoteAttachmentVariables) =>
      unwrapActionResult(await deleteStudyNoteAttachment(noteId, attachmentId)),
  });
}
