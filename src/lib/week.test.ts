import { describe, expect, it } from "vitest";
import { getWeekDateKeys, parseWeekOffset } from "./week";

const THURSDAY = new Date("2026-10-01T15:00:00Z");

describe("getWeekDateKeys", () => {
  it("returns Monday to Sunday of the current week", () => {
    expect(getWeekDateKeys(0, THURSDAY)).toEqual([
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
    ]);
  });

  it("moves whole weeks with the offset", () => {
    expect(getWeekDateKeys(1, THURSDAY)[0]).toBe("2026-10-05");
    expect(getWeekDateKeys(-1, THURSDAY)[0]).toBe("2026-09-21");
  });
});

describe("parseWeekOffset", () => {
  it("falls back to the current week for invalid values", () => {
    expect(parseWeekOffset(undefined)).toBe(0);
    expect(parseWeekOffset("abc")).toBe(0);
    expect(parseWeekOffset("2")).toBe(2);
  });
});
