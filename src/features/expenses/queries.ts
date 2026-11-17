import "server-only";

import { toDateKey } from "@/lib/dates";
import type { MonthRange } from "@/lib/months";
import { listMockExpensePayments, listMockExpenses } from "@/mocks/expenses";
import {
  buildMonthOccurrences,
  type ExpenseMonthGroups,
  groupMonthOccurrences,
} from "./occurrences";

export async function getMonthExpenses(
  range: MonthRange,
): Promise<ExpenseMonthGroups> {
  return groupMonthOccurrences(
    buildMonthOccurrences(
      listMockExpenses(),
      listMockExpensePayments(),
      range,
      toDateKey(new Date()),
    ),
  );
}
