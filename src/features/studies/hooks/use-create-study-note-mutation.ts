import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { createStudyNote } from "../actions";

export function getCreateStudyNoteMutationKey() {
  return ["studies", "create"] as const;
}

export function useCreateStudyNoteMutation() {
  return useMutation({
    mutationKey: getCreateStudyNoteMutationKey(),
    mutationFn: async () => unwrapActionResult(await createStudyNote()),
  });
}
