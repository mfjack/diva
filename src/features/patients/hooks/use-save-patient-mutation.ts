import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { savePatient } from "../actions";
import type { PatientInput } from "../schemas";
import type { PatientId } from "../types";

type SavePatientVariables = {
  patientId: PatientId | null;
  input: PatientInput;
};

export function getSavePatientMutationKey() {
  return ["patients", "save"] as const;
}

export function useSavePatientMutation() {
  return useMutation({
    mutationKey: getSavePatientMutationKey(),
    mutationFn: async ({ patientId, input }: SavePatientVariables) =>
      unwrapActionResult(await savePatient(patientId, input)),
  });
}
