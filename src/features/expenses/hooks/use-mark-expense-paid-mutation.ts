import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { markExpenseOccurrencePaid } from "../actions";
import type { ExpenseOccurrenceInput } from "../schemas";

export function getMarkExpensePaidMutationKey() {
  return ["expenses", "mark-paid"] as const;
}

export function useMarkExpensePaidMutation() {
  return useMutation({
    mutationKey: getMarkExpensePaidMutationKey(),
    mutationFn: async (input: ExpenseOccurrenceInput) =>
      unwrapActionResult(await markExpenseOccurrencePaid(input)),
  });
}
