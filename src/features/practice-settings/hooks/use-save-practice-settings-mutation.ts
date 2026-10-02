import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { savePracticeSettings } from "../actions";
import type { PracticeSettingsInput } from "../schemas";

export function getSavePracticeSettingsMutationKey() {
  return ["practice-settings", "save"] as const;
}

export function useSavePracticeSettingsMutation() {
  return useMutation({
    mutationKey: getSavePracticeSettingsMutationKey(),
    mutationFn: async (input: PracticeSettingsInput) =>
      unwrapActionResult(await savePracticeSettings(input)),
  });
}
