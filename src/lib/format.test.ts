import { describe, expect, it } from "vitest";
import { formatCurrency, formatDateTime, formatShortDate } from "./format";
import { toCents } from "./money";

describe("formatCurrency", () => {
  it("formats cents with the dollar symbol", () => {
    expect(formatCurrency(toCents(180))).toBe("$ 180,00");
  });

  it("formats negative amounts with a leading sign", () => {
    expect(formatCurrency(toCents(-18.5))).toBe("-$ 18,50");
  });
});

describe("formatDateTime", () => {
  it("converts UTC to the São Paulo time zone", () => {
    expect(formatDateTime("2026-10-01T17:00:00Z")).toBe("01/10/2026 às 14:00");
  });
});

describe("formatShortDate", () => {
  it("shows weekday, day and month in São Paulo time", () => {
    expect(formatShortDate("2026-11-18T21:00:00.000Z")).toBe("qua, 18 nov");
  });
});
