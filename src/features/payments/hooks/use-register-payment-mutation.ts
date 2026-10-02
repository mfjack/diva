import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { registerPayment } from "../actions";
import type { RegisterPaymentInput } from "../schemas";
import type { PaymentId } from "../types";

type RegisterPaymentVariables = {
  paymentId: PaymentId;
  input: RegisterPaymentInput;
};

export function getRegisterPaymentMutationKey() {
  return ["payments", "register"] as const;
}

export function useRegisterPaymentMutation() {
  return useMutation({
    mutationKey: getRegisterPaymentMutationKey(),
    mutationFn: async ({ paymentId, input }: RegisterPaymentVariables) =>
      unwrapActionResult(await registerPayment(paymentId, input)),
  });
}
