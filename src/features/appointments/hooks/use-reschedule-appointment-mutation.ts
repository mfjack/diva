import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { rescheduleAppointment } from "../actions";
import type { RescheduleAppointmentInput } from "../schemas";
import type { AppointmentId } from "../types";

type RescheduleAppointmentVariables = {
  appointmentId: AppointmentId;
  input: RescheduleAppointmentInput;
};

export function getRescheduleAppointmentMutationKey() {
  return ["appointments", "reschedule"] as const;
}

export function useRescheduleAppointmentMutation() {
  return useMutation({
    mutationKey: getRescheduleAppointmentMutationKey(),
    mutationFn: async ({
      appointmentId,
      input,
    }: RescheduleAppointmentVariables) =>
      unwrapActionResult(await rescheduleAppointment(appointmentId, input)),
  });
}
