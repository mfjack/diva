import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { saveExpense } from "../actions";
import type { ExpenseInput } from "../schemas";
import type { ExpenseId } from "../types";

type SaveExpenseVariables = {
  expenseId: ExpenseId | null;
  input: ExpenseInput;
};

export function getSaveExpenseMutationKey() {
  return ["expenses", "save"] as const;
}

export function useSaveExpenseMutation() {
  return useMutation({
    mutationKey: getSaveExpenseMutationKey(),
    mutationFn: async ({ expenseId, input }: SaveExpenseVariables) =>
      unwrapActionResult(await saveExpense(expenseId, input)),
  });
}
