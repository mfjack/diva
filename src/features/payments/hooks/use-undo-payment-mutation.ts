import { useMutation } from "@tanstack/react-query";
import type { AppointmentId } from "@/features/appointments/types";
import { unwrapActionResult } from "@/lib/action-result";
import { undoPayment } from "../actions";

export function getUndoPaymentMutationKey() {
  return ["payments", "undo"] as const;
}

export function useUndoPaymentMutation() {
  return useMutation({
    mutationKey: getUndoPaymentMutationKey(),
    mutationFn: async (appointmentId: AppointmentId) =>
      unwrapActionResult(await undoPayment(appointmentId)),
  });
}
