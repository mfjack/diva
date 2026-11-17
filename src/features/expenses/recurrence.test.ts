import { describe, expect, it } from "vitest";
import {
  canEndRecurrence,
  type ExpenseSchedule,
  isOccurrenceOf,
  listOccurrenceEntriesBetween,
  listOccurrencesBetween,
} from "./recurrence";

const monthly: ExpenseSchedule = {
  recurrence: "monthly",
  startsOn: "2026-12-15",
  endsOn: null,
  installmentCount: null,
};

const once: ExpenseSchedule = {
  recurrence: "once",
  startsOn: "2026-11-10",
  endsOn: null,
  installmentCount: null,
};

describe("listOccurrencesBetween", () => {
  it("repeats monthly expenses on the same day", () => {
    expect(listOccurrencesBetween(monthly, "2026-11-01", "2027-02-28")).toEqual(
      ["2026-12-15", "2027-01-15", "2027-02-15"],
    );
  });

  it("uses the last day of shorter months", () => {
    expect(
      listOccurrencesBetween(
        { ...monthly, startsOn: "2027-01-31" },
        "2027-02-01",
        "2027-02-28",
      ),
    ).toEqual(["2027-02-28"]);
  });

  it("repeats weekly expenses every seven days", () => {
    expect(
      listOccurrencesBetween(
        {
          recurrence: "weekly",
          startsOn: "2026-11-02",
          endsOn: null,
          installmentCount: null,
        },
        "2026-11-10",
        "2026-11-30",
      ),
    ).toEqual(["2026-11-16", "2026-11-23", "2026-11-30"]);
  });

  it("stops at the end date", () => {
    expect(
      listOccurrencesBetween(
        { ...monthly, endsOn: "2027-01-20" },
        "2026-11-01",
        "2027-12-31",
      ),
    ).toEqual(["2026-12-15", "2027-01-15"]);
  });

  it("counts one-time expenses only inside the range", () => {
    expect(listOccurrencesBetween(once, "2026-11-01", "2026-11-30")).toEqual([
      "2026-11-10",
    ]);
    expect(listOccurrencesBetween(once, "2026-12-01", "2026-12-31")).toEqual(
      [],
    );
  });
});

describe("installments", () => {
  const installments: ExpenseSchedule = {
    recurrence: "installments",
    startsOn: "2026-12-10",
    endsOn: null,
    installmentCount: 3,
  };

  it("repeats monthly only for the number of installments", () => {
    expect(
      listOccurrenceEntriesBetween(installments, "2026-01-01", "2027-12-31"),
    ).toEqual([
      { dueOn: "2026-12-10", number: 1 },
      { dueOn: "2027-01-10", number: 2 },
      { dueOn: "2027-02-10", number: 3 },
    ]);
  });

  it("keeps the installment number when looking at a single month", () => {
    expect(
      listOccurrenceEntriesBetween(installments, "2027-01-01", "2027-01-31"),
    ).toEqual([{ dueOn: "2027-01-10", number: 2 }]);
  });
});

describe("isOccurrenceOf", () => {
  it("accepts only dates that belong to the schedule", () => {
    expect(isOccurrenceOf(monthly, "2027-01-15")).toBe(true);
    expect(isOccurrenceOf(monthly, "2027-01-16")).toBe(false);
    expect(isOccurrenceOf(monthly, "2026-11-15")).toBe(false);
  });
});

describe("canEndRecurrence", () => {
  it("allows ending only started, open recurring expenses", () => {
    expect(
      canEndRecurrence({ ...monthly, startsOn: "2026-10-15" }, "2026-11-17"),
    ).toBe(true);
    expect(canEndRecurrence(monthly, "2026-11-17")).toBe(false);
    expect(canEndRecurrence(once, "2026-11-17")).toBe(false);
  });
});
