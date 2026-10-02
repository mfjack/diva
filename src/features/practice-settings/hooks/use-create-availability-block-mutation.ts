import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { createAvailabilityBlock } from "../actions";
import type { AvailabilityBlockInput } from "../schemas";

export function getCreateAvailabilityBlockMutationKey() {
  return ["practice-settings", "blocks", "create"] as const;
}

export function useCreateAvailabilityBlockMutation() {
  return useMutation({
    mutationKey: getCreateAvailabilityBlockMutationKey(),
    mutationFn: async (input: AvailabilityBlockInput) =>
      unwrapActionResult(await createAvailabilityBlock(input)),
  });
}
