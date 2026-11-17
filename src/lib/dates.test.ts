import { describe, expect, it } from "vitest";
import { dateKeyToLocalDate, formatDateKey, localDateToDateKey } from "./dates";

describe("date key conversion", () => {
  it("round-trips a date key through a local date", () => {
    const date = dateKeyToLocalDate("2026-11-18");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10);
    expect(date.getDate()).toBe(18);
    expect(localDateToDateKey(date)).toBe("2026-11-18");
  });
});

describe("formatDateKey", () => {
  it("keeps the calendar day of a date key", () => {
    expect(formatDateKey("2026-11-16")).toBe("16/11/2026");
  });
});
