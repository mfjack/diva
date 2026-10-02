import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { createAppointment } from "../actions";
import type { CreateAppointmentInput } from "../schemas";

export function getCreateAppointmentMutationKey() {
  return ["appointments", "create"] as const;
}

export function useCreateAppointmentMutation() {
  return useMutation({
    mutationKey: getCreateAppointmentMutationKey(),
    mutationFn: async (input: CreateAppointmentInput) =>
      unwrapActionResult(await createAppointment(input)),
  });
}
