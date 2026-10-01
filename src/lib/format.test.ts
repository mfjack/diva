import { describe, expect, it } from "vitest";
import { formatCurrency, formatDateTime } from "./format";
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
