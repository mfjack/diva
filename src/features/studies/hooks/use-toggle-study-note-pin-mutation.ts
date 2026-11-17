import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { toggleStudyNotePin } from "../actions";
import type { StudyNoteId } from "../types";

export function getToggleStudyNotePinMutationKey() {
  return ["studies", "toggle-pin"] as const;
}

export function useToggleStudyNotePinMutation() {
  return useMutation({
    mutationKey: getToggleStudyNotePinMutationKey(),
    mutationFn: async (noteId: StudyNoteId) =>
      unwrapActionResult(await toggleStudyNotePin(noteId)),
  });
}
