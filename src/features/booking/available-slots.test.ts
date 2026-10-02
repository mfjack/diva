import { describe, expect, it } from "vitest";
import type {
  AvailabilityBlockId,
  AvailabilityRule,
  AvailabilityRuleId,
} from "@/features/practice-settings/types";
import { formatTime } from "@/lib/format";
import {
  getAvailableSlots,
  getBookableDateKeys,
  getSlotStepMinutes,
  type SlotAvailabilityInput,
} from "./available-slots";

const MONDAY = "2026-10-05";
const TUESDAY = "2026-10-06";

const mondayMorning: AvailabilityRule = {
  id: "rule-1" as AvailabilityRuleId,
  weekday: 1,
  startTime: "08:00",
  endTime: "12:00",
  modality: null,
};

function buildInput(
  overrides: Partial<SlotAvailabilityInput> = {},
): SlotAvailabilityInput {
  return {
    rules: [mondayMorning],
    blocks: [],
    busyPeriods: [],
    sessionDurationMinutes: 50,
    minimumBookingNoticeHours: 2,
    now: new Date("2026-10-01T12:00:00Z"),
    ...overrides,
  };
}

function slotTimes(dateKey: string, input: SlotAvailabilityInput) {
  return getAvailableSlots(dateKey, input).map((slot) =>
    formatTime(slot.startsAt),
  );
}

describe("getSlotStepMinutes", () => {
  it("rounds the session duration up to half hours", () => {
    expect(getSlotStepMinutes(50)).toBe(60);
    expect(getSlotStepMinutes(30)).toBe(30);
    expect(getSlotStepMinutes(80)).toBe(90);
  });
});

describe("getAvailableSlots", () => {
  it("splits the working period into whole sessions in São Paulo time", () => {
    expect(slotTimes(MONDAY, buildInput())).toEqual([
      "08:00",
      "09:00",
      "10:00",
      "11:00",
    ]);
  });

  it("returns nothing on days without rules", () => {
    expect(slotTimes(TUESDAY, buildInput())).toEqual([]);
  });

  it("skips slots that overlap booked sessions and blocks", () => {
    const input = buildInput({
      busyPeriods: [
        { startsAt: "2026-10-05T12:00:00Z", endsAt: "2026-10-05T12:50:00Z" },
      ],
      blocks: [
        {
          id: "block-1" as AvailabilityBlockId,
          startsAt: "2026-10-05T14:30:00Z",
          endsAt: "2026-10-05T15:00:00Z",
          reason: null,
        },
      ],
    });
    expect(slotTimes(MONDAY, input)).toEqual(["08:00", "10:00"]);
  });

  it("respects the minimum booking notice", () => {
    const input = buildInput({ now: new Date("2026-10-05T11:30:00Z") });
    expect(slotTimes(MONDAY, input)).toEqual(["11:00"]);
  });
});

describe("getBookableDateKeys", () => {
  it("lists only days with free slots inside the booking window", () => {
    expect(getBookableDateKeys(11, buildInput())).toEqual([
      "2026-10-05",
      "2026-10-12",
    ]);
  });
});
