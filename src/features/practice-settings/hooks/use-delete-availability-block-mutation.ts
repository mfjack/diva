import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { deleteAvailabilityBlock } from "../actions";
import type { AvailabilityBlockId } from "../types";

export function getDeleteAvailabilityBlockMutationKey() {
  return ["practice-settings", "blocks", "delete"] as const;
}

export function useDeleteAvailabilityBlockMutation() {
  return useMutation({
    mutationKey: getDeleteAvailabilityBlockMutationKey(),
    mutationFn: async (blockId: AvailabilityBlockId) =>
      unwrapActionResult(await deleteAvailabilityBlock(blockId)),
  });
}
