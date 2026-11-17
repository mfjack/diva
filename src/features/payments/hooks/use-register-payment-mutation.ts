import { useMutation } from "@tanstack/react-query";
import type { AppointmentId } from "@/features/appointments/types";
import { unwrapActionResult } from "@/lib/action-result";
import { registerPayment } from "../actions";
import type { RegisterPaymentInput } from "../schemas";

type RegisterPaymentVariables = {
  appointmentId: AppointmentId;
  input: RegisterPaymentInput;
};

export function getRegisterPaymentMutationKey() {
  return ["payments", "register"] as const;
}

export function useRegisterPaymentMutation() {
  return useMutation({
    mutationKey: getRegisterPaymentMutationKey(),
    mutationFn: async ({ appointmentId, input }: RegisterPaymentVariables) =>
      unwrapActionResult(await registerPayment(appointmentId, input)),
  });
}
