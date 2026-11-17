import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { cancelExpenseOccurrencePayment } from "../actions";
import type { ExpenseOccurrenceInput } from "../schemas";

export function getCancelExpensePaymentMutationKey() {
  return ["expenses", "cancel-payment"] as const;
}

export function useCancelExpensePaymentMutation() {
  return useMutation({
    mutationKey: getCancelExpensePaymentMutationKey(),
    mutationFn: async (input: ExpenseOccurrenceInput) =>
      unwrapActionResult(await cancelExpenseOccurrencePayment(input)),
  });
}
