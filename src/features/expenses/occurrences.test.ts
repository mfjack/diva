import { describe, expect, it } from "vitest";
import type { Cents } from "@/lib/money";
import { getMonthRange } from "@/lib/months";
import {
  buildMonthOccurrences,
  groupMonthOccurrences,
  summarizeMonthExpenses,
} from "./occurrences";
import type {
  Expense,
  ExpenseId,
  ExpensePayment,
  ExpensePaymentId,
} from "./types";

const TODAY = "2026-11-17";
const NOVEMBER = getMonthRange("2026-11");

function createExpense(overrides: Partial<Expense>): Expense {
  return {
    id: "expense-1" as ExpenseId,
    description: "Supervisão",
    category: "supervision",
    amountCents: 40000 as Cents,
    recurrence: "monthly",
    startsOn: "2026-09-15",
    endsOn: null,
    installmentCount: null,
    notes: null,
    attachments: [],
    createdAt: "2026-09-01T12:00:00.000Z",
    ...overrides,
  };
}

function createPayment(dueOn: string): ExpensePayment {
  return {
    id: `payment-${dueOn}` as ExpensePaymentId,
    expenseId: "expense-1" as ExpenseId,
    dueOn,
    paidOn: dueOn,
  };
}

describe("buildMonthOccurrences", () => {
  it("carries unpaid occurrences of earlier months into the current one", () => {
    const occurrences = buildMonthOccurrences(
      [createExpense({})],
      [createPayment("2026-09-15")],
      NOVEMBER,
      TODAY,
    );
    expect(occurrences.map(({ dueOn, status }) => [dueOn, status])).toEqual([
      ["2026-10-15", "overdue"],
      ["2026-11-15", "overdue"],
    ]);
  });

  it("shows only the month itself when browsing other months", () => {
    const occurrences = buildMonthOccurrences(
      [createExpense({})],
      [],
      getMonthRange("2026-12"),
      TODAY,
    );
    expect(occurrences.map(({ dueOn, status }) => [dueOn, status])).toEqual([
      ["2026-12-15", "pending"],
    ]);
  });
});

describe("groupMonthOccurrences", () => {
  it("separates overdue, upcoming and paid bills", () => {
    const occurrences = buildMonthOccurrences(
      [
        createExpense({}),
        createExpense({
          id: "expense-2" as ExpenseId,
          recurrence: "once",
          startsOn: "2026-11-25",
        }),
      ],
      [createPayment("2026-09-15"), createPayment("2026-10-15")],
      NOVEMBER,
      TODAY,
    );
    const groups = groupMonthOccurrences(occurrences);
    expect(groups.overdue.map(({ dueOn }) => dueOn)).toEqual(["2026-11-15"]);
    expect(groups.upcoming.map(({ dueOn }) => dueOn)).toEqual(["2026-11-25"]);
    expect(groups.paid).toEqual([]);
  });
});

describe("summarizeMonthExpenses", () => {
  it("totals each group and the recurring bills of the month", () => {
    const groups = groupMonthOccurrences(
      buildMonthOccurrences(
        [
          createExpense({}),
          createExpense({
            id: "expense-2" as ExpenseId,
            recurrence: "once",
            startsOn: "2026-11-25",
            amountCents: 10000 as Cents,
          }),
        ],
        [createPayment("2026-09-15"), createPayment("2026-10-15")],
        NOVEMBER,
        TODAY,
      ),
    );
    expect(summarizeMonthExpenses(groups, NOVEMBER)).toEqual({
      overdueCents: 40000,
      upcomingCents: 10000,
      paidCents: 0,
      recurringCents: 40000,
    });
  });
});
