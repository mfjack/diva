import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { saveWeeklyAvailability } from "../actions";
import type { WeeklyAvailabilityInput } from "../schemas";

export function getSaveWeeklyAvailabilityMutationKey() {
  return ["practice-settings", "availability", "save"] as const;
}

export function useSaveWeeklyAvailabilityMutation() {
  return useMutation({
    mutationKey: getSaveWeeklyAvailabilityMutationKey(),
    mutationFn: async (input: WeeklyAvailabilityInput) =>
      unwrapActionResult(await saveWeeklyAvailability(input)),
  });
}
