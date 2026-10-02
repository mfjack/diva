import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { saveClinicalRecord } from "../actions";
import type { ClinicalRecordInput } from "../schemas";
import type { ClinicalRecordId } from "../types";

type SaveClinicalRecordVariables = {
  recordId: ClinicalRecordId | null;
  input: ClinicalRecordInput;
};

export function getSaveClinicalRecordMutationKey() {
  return ["clinical-records", "save"] as const;
}

export function useSaveClinicalRecordMutation() {
  return useMutation({
    mutationKey: getSaveClinicalRecordMutationKey(),
    mutationFn: async ({ recordId, input }: SaveClinicalRecordVariables) =>
      unwrapActionResult(await saveClinicalRecord(recordId, input)),
  });
}
