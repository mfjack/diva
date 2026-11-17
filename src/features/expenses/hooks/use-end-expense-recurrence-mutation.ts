import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { endExpenseRecurrence } from "../actions";
import type { ExpenseId } from "../types";

export function getEndExpenseRecurrenceMutationKey() {
  return ["expenses", "end-recurrence"] as const;
}

export function useEndExpenseRecurrenceMutation() {
  return useMutation({
    mutationKey: getEndExpenseRecurrenceMutationKey(),
    mutationFn: async (expenseId: ExpenseId) =>
      unwrapActionResult(await endExpenseRecurrence(expenseId)),
  });
}
