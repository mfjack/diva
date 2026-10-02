"use server";

import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { type RegisterPaymentInput, registerPaymentSchema } from "./schemas";
import type { PaymentId } from "./types";

export async function registerPayment(
  _paymentId: PaymentId,
  input: RegisterPaymentInput,
): Promise<ActionResult> {
  const parsedInput = registerPaymentSchema.safeParse(input);
  if (!parsedInput.success) {
    return actionFailure("Confira os campos destacados.");
  }

  return actionSuccess();
}
