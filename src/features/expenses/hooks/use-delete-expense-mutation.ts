import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { deleteExpense } from "../actions";
import type { ExpenseId } from "../types";

export function getDeleteExpenseMutationKey() {
  return ["expenses", "delete"] as const;
}

export function useDeleteExpenseMutation() {
  return useMutation({
    mutationKey: getDeleteExpenseMutationKey(),
    mutationFn: async (expenseId: ExpenseId) =>
      unwrapActionResult(await deleteExpense(expenseId)),
  });
}
