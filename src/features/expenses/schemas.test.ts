import { describe, expect, it } from "vitest";
import { expenseSchema } from "./schemas";

const validExpense = {
  description: "Supervisão clínica",
  category: "supervision",
  amount: 250,
  recurrence: "monthly",
  startsOn: "2026-12-15",
  notes: "",
};

describe("expenseSchema", () => {
  it("accepts a valid expense", () => {
    expect(expenseSchema.safeParse(validExpense).success).toBe(true);
  });

  it("rejects zero or negative amounts", () => {
    expect(
      expenseSchema.safeParse({ ...validExpense, amount: 0 }).success,
    ).toBe(false);
  });

  it("rejects unknown recurrences", () => {
    expect(
      expenseSchema.safeParse({ ...validExpense, recurrence: "daily" }).success,
    ).toBe(false);
  });

  it("rejects unknown categories", () => {
    expect(
      expenseSchema.safeParse({ ...validExpense, category: "travel" }).success,
    ).toBe(false);
  });
});
