import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { cancelAppointment } from "../actions";
import type { CancelAppointmentInput } from "../schemas";
import type { AppointmentId } from "../types";

type CancelAppointmentVariables = {
  appointmentId: AppointmentId;
  input: CancelAppointmentInput;
};

export function getCancelAppointmentMutationKey() {
  return ["appointments", "cancel"] as const;
}

export function useCancelAppointmentMutation() {
  return useMutation({
    mutationKey: getCancelAppointmentMutationKey(),
    mutationFn: async ({ appointmentId, input }: CancelAppointmentVariables) =>
      unwrapActionResult(await cancelAppointment(appointmentId, input)),
  });
}
