import { describe, expect, it } from "vitest";
import {
  buildTimeSlots,
  DEFAULT_TIME_SLOT_OPTIONS,
  groupTimeSlotsByPeriod,
  minutesToTime,
  roundUpToFullHour,
  timeToMinutes,
} from "./time-slots";

describe("time conversions", () => {
  it("converts between clock time and minutes", () => {
    expect(timeToMinutes("08:30")).toBe(510);
    expect(minutesToTime(510)).toBe("08:30");
  });

  it("rounds up to the next full hour", () => {
    expect(roundUpToFullHour(timeToMinutes("07:30"))).toBe(480);
    expect(roundUpToFullHour(timeToMinutes("08:00"))).toBe(480);
  });

  it("offers only full hours by default", () => {
    expect(buildTimeSlots(DEFAULT_TIME_SLOT_OPTIONS).slice(0, 3)).toEqual([
      "06:00",
      "07:00",
      "08:00",
    ]);
  });
});

describe("buildTimeSlots", () => {
  it("builds slots including both ends", () => {
    expect(
      buildTimeSlots({ startHour: 9, endHour: 10, stepMinutes: 15 }),
    ).toEqual(["09:00", "09:15", "09:30", "09:45", "10:00"]);
  });
});

describe("groupTimeSlotsByPeriod", () => {
  it("groups morning, afternoon and evening in order", () => {
    expect(groupTimeSlotsByPeriod(["11:30", "12:00", "18:00"])).toEqual([
      { period: "morning", label: "Manhã", times: ["11:30"] },
      { period: "afternoon", label: "Tarde", times: ["12:00"] },
      { period: "evening", label: "Noite", times: ["18:00"] },
    ]);
  });

  it("skips empty periods", () => {
    expect(groupTimeSlotsByPeriod(["14:00"])).toEqual([
      { period: "afternoon", label: "Tarde", times: ["14:00"] },
    ]);
  });
});
