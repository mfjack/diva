import { describe, expect, it } from "vitest";
import {
  addMonthsToMonthKey,
  formatMonthLabel,
  getMonthRange,
  isDateKeyInRange,
  isMonthKey,
} from "./months";

describe("isMonthKey", () => {
  it("accepts only yyyy-MM values", () => {
    expect(isMonthKey("2026-11")).toBe(true);
    expect(isMonthKey("2026-13")).toBe(false);
    expect(isMonthKey("novembro")).toBe(false);
    expect(isMonthKey(undefined)).toBe(false);
  });
});

describe("getMonthRange", () => {
  it("returns the first and last day of the month", () => {
    expect(getMonthRange("2027-02")).toEqual({
      monthKey: "2027-02",
      startKey: "2027-02-01",
      endKey: "2027-02-28",
    });
  });
});

describe("isDateKeyInRange", () => {
  it("includes both ends of the month", () => {
    const range = getMonthRange("2026-11");
    expect(isDateKeyInRange("2026-11-01", range)).toBe(true);
    expect(isDateKeyInRange("2026-11-30", range)).toBe(true);
    expect(isDateKeyInRange("2026-12-01", range)).toBe(false);
  });
});

describe("addMonthsToMonthKey", () => {
  it("moves across years", () => {
    expect(addMonthsToMonthKey("2026-12", 1)).toBe("2027-01");
    expect(addMonthsToMonthKey("2026-01", -1)).toBe("2025-12");
  });
});

describe("formatMonthLabel", () => {
  it("writes the month name in Portuguese", () => {
    expect(formatMonthLabel("2026-11")).toBe("Novembro de 2026");
  });
});
