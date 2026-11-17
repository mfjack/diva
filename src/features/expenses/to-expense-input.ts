import { fromCents } from "@/lib/money";
import type { ExpenseInput } from "./schemas";
import type { Expense } from "./types";

export function toExpenseInput(expense: Expense): ExpenseInput {
  return {
    description: expense.description,
    category: expense.category,
    amount: fromCents(expense.amountCents),
    recurrence: expense.recurrence,
    startsOn: expense.startsOn,
    installmentCount: expense.installmentCount ?? undefined,
    notes: expense.notes ?? "",
  };
}
