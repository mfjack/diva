import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { deletePatient } from "../actions";
import type { PatientId } from "../types";

export function getDeletePatientMutationKey() {
  return ["patients", "delete"] as const;
}

export function useDeletePatientMutation() {
  return useMutation({
    mutationKey: getDeletePatientMutationKey(),
    mutationFn: async (patientId: PatientId) =>
      unwrapActionResult(await deletePatient(patientId)),
  });
}
