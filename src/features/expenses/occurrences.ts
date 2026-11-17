import { addDaysToDateKey } from "@/lib/dates";
import type { Cents } from "@/lib/money";
import { isDateKeyInRange, type MonthRange } from "@/lib/months";
import {
  type ExpenseOccurrenceEntry,
  listOccurrenceEntriesBetween,
} from "./recurrence";
import type {
  Expense,
  ExpenseOccurrence,
  ExpenseOccurrenceStatus,
  ExpensePayment,
} from "./types";

export type ExpenseMonthGroups = {
  overdue: ExpenseOccurrence[];
  upcoming: ExpenseOccurrence[];
  paid: ExpenseOccurrence[];
};

type ExpenseMonthSummary = {
  overdueCents: Cents;
  upcomingCents: Cents;
  paidCents: Cents;
  recurringCents: Cents;
};

export function getOccurrenceKey(expenseId: string, dueOn: string): string {
  return `${expenseId}:${dueOn}`;
}

function getOccurrenceStatus(
  dueOn: string,
  paidOn: string | null,
  todayKey: string,
): ExpenseOccurrenceStatus {
  if (paidOn !== null) return "paid";
  return dueOn < todayKey ? "overdue" : "pending";
}

function listMonthEntries(
  expense: Expense,
  range: MonthRange,
  todayKey: string,
): ExpenseOccurrenceEntry[] {
  const monthEntries = listOccurrenceEntriesBetween(
    expense,
    range.startKey,
    range.endKey,
  );
  if (!isDateKeyInRange(todayKey, range)) return monthEntries;
  const earlierEntries = listOccurrenceEntriesBetween(
    expense,
    expense.startsOn,
    addDaysToDateKey(range.startKey, -1),
  );
  return [...earlierEntries, ...monthEntries];
}

export function buildMonthOccurrences(
  expenses: readonly Expense[],
  payments: readonly ExpensePayment[],
  range: MonthRange,
  todayKey: string,
): ExpenseOccurrence[] {
  const paidOnByKey = new Map(
    payments.map(({ expenseId, dueOn, paidOn }) => [
      getOccurrenceKey(expenseId, dueOn),
      paidOn,
    ]),
  );

  return expenses
    .flatMap((expense) =>
      listMonthEntries(expense, range, todayKey).map(({ dueOn, number }) => {
        const paidOn =
          paidOnByKey.get(getOccurrenceKey(expense.id, dueOn)) ?? null;
        return {
          expense,
          dueOn,
          paidOn,
          installmentNumber:
            expense.recurrence === "installments" ? number : null,
          status: getOccurrenceStatus(dueOn, paidOn, todayKey),
        };
      }),
    )
    .filter(
      ({ dueOn, status }) =>
        isDateKeyInRange(dueOn, range) || status === "overdue",
    )
    .sort((first, second) => first.dueOn.localeCompare(second.dueOn));
}

export function groupMonthOccurrences(
  occurrences: readonly ExpenseOccurrence[],
): ExpenseMonthGroups {
  return {
    overdue: occurrences.filter(({ status }) => status === "overdue"),
    upcoming: occurrences.filter(({ status }) => status === "pending"),
    paid: occurrences.filter(({ status }) => status === "paid").reverse(),
  };
}

export function sumOccurrences(
  occurrences: readonly ExpenseOccurrence[],
): Cents {
  return occurrences.reduce(
    (total, { expense }) => total + expense.amountCents,
    0,
  ) as Cents;
}

export function summarizeMonthExpenses(
  groups: ExpenseMonthGroups,
  range: MonthRange,
): ExpenseMonthSummary {
  const monthOccurrences = [
    ...groups.overdue,
    ...groups.upcoming,
    ...groups.paid,
  ].filter(({ dueOn }) => isDateKeyInRange(dueOn, range));

  return {
    overdueCents: sumOccurrences(groups.overdue),
    upcomingCents: sumOccurrences(groups.upcoming),
    paidCents: sumOccurrences(groups.paid),
    recurringCents: sumOccurrences(
      monthOccurrences.filter(({ expense }) => expense.recurrence !== "once"),
    ),
  };
}
