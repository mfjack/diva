import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { uploadStudyNoteAttachment } from "../actions";
import type { StudyNoteId } from "../types";

type UploadStudyNoteAttachmentVariables = {
  noteId: StudyNoteId;
  file: File;
};

export function getUploadStudyNoteAttachmentMutationKey() {
  return ["studies", "upload-attachment"] as const;
}

export function useUploadStudyNoteAttachmentMutation() {
  return useMutation({
    mutationKey: getUploadStudyNoteAttachmentMutationKey(),
    mutationFn: async ({
      noteId,
      file,
    }: UploadStudyNoteAttachmentVariables) => {
      const formData = new FormData();
      formData.set("file", file);
      return unwrapActionResult(
        await uploadStudyNoteAttachment(noteId, formData),
      );
    },
  });
}
