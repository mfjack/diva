import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { deleteStudyNote } from "../actions";
import type { StudyNoteId } from "../types";

export function getDeleteStudyNoteMutationKey() {
  return ["studies", "delete"] as const;
}

export function useDeleteStudyNoteMutation() {
  return useMutation({
    mutationKey: getDeleteStudyNoteMutationKey(),
    mutationFn: async (noteId: StudyNoteId) =>
      unwrapActionResult(await deleteStudyNote(noteId)),
  });
}
