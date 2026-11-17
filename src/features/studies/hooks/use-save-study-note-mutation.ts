import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { saveStudyNote } from "../actions";
import type { StudyNoteInput } from "../schemas";
import type { StudyNoteId } from "../types";

type SaveStudyNoteVariables = {
  noteId: StudyNoteId;
  input: StudyNoteInput;
};

export function getSaveStudyNoteMutationKey(noteId: StudyNoteId) {
  return ["studies", "save", noteId] as const;
}

export function useSaveStudyNoteMutation(noteId: StudyNoteId) {
  return useMutation({
    mutationKey: getSaveStudyNoteMutationKey(noteId),
    mutationFn: async ({ input }: Omit<SaveStudyNoteVariables, "noteId">) =>
      unwrapActionResult(await saveStudyNote(noteId, input)),
  });
}
