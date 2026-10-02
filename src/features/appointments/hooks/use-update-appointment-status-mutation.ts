import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { updateAppointmentStatus } from "../actions";
import type { AppointmentStatusUpdate } from "../schemas";
import type { AppointmentId } from "../types";

type UpdateAppointmentStatusVariables = {
  appointmentId: AppointmentId;
  status: AppointmentStatusUpdate;
};

export function getUpdateAppointmentStatusMutationKey() {
  return ["appointments", "update-status"] as const;
}

export function useUpdateAppointmentStatusMutation() {
  return useMutation({
    mutationKey: getUpdateAppointmentStatusMutationKey(),
    mutationFn: async ({
      appointmentId,
      status,
    }: UpdateAppointmentStatusVariables) =>
      unwrapActionResult(await updateAppointmentStatus(appointmentId, status)),
  });
}
