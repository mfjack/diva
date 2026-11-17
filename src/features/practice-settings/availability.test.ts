import { describe, expect, it } from "vitest";
import {
  isWithinAvailability,
  listAvailableTimes,
  type SessionAvailability,
} from "./availability";
import type { AvailabilityRule, AvailabilityRuleId } from "./types";

const WEDNESDAY = "2026-12-02";
const SUNDAY = "2026-12-06";

function createRule(
  overrides: Pick<AvailabilityRule, "startTime" | "endTime">,
): AvailabilityRule {
  return {
    id: `rule-${overrides.startTime}` as AvailabilityRuleId,
    weekday: 3,
    modality: null,
    ...overrides,
  };
}

const availability: SessionAvailability = {
  rules: [
    createRule({ startTime: "07:30", endTime: "10:00" }),
    createRule({ startTime: "18:00", endTime: "19:00" }),
  ],
  sessionDurationMinutes: 50,
};

describe("listAvailableTimes", () => {
  it("lists full hours that fit the whole session", () => {
    expect(listAvailableTimes(availability, WEDNESDAY)).toEqual([
      "08:00",
      "09:00",
      "18:00",
    ]);
  });

  it("returns nothing on days without availability", () => {
    expect(listAvailableTimes(availability, SUNDAY)).toEqual([]);
  });
});

describe("isWithinAvailability", () => {
  it("accepts sessions that end before the interval closes", () => {
    expect(isWithinAvailability(availability, WEDNESDAY, "09:00")).toBe(true);
  });

  it("rejects sessions that overflow the interval", () => {
    expect(isWithinAvailability(availability, WEDNESDAY, "09:15")).toBe(false);
    expect(isWithinAvailability(availability, SUNDAY, "08:00")).toBe(false);
  });
});
