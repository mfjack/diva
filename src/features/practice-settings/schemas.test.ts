import { describe, expect, it } from "vitest";
import {
  type AvailabilityIntervalInput,
  availabilityBlockSchema,
  weeklyAvailabilitySchema,
} from "./schemas";

function interval(
  weekday: number,
  startTime: string,
  endTime: string,
): AvailabilityIntervalInput {
  return { weekday, startTime, endTime, modality: "any" };
}

describe("weeklyAvailabilitySchema", () => {
  it("accepts separate periods on the same day", () => {
    const result = weeklyAvailabilitySchema.safeParse({
      intervals: [interval(1, "08:00", "12:00"), interval(1, "14:00", "18:00")],
    });
    expect(result.success).toBe(true);
  });

  it("rejects overlapping periods on the same day", () => {
    const result = weeklyAvailabilitySchema.safeParse({
      intervals: [interval(1, "08:00", "12:00"), interval(1, "11:00", "13:00")],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([
      "intervals",
      1,
      "startTime",
    ]);
  });

  it("allows the same period on different days", () => {
    const result = weeklyAvailabilitySchema.safeParse({
      intervals: [interval(1, "08:00", "12:00"), interval(2, "08:00", "12:00")],
    });
    expect(result.success).toBe(true);
  });

  it("rejects periods that end before they start", () => {
    const result = weeklyAvailabilitySchema.safeParse({
      intervals: [interval(3, "12:00", "09:00")],
    });
    expect(result.success).toBe(false);
  });
});

describe("availabilityBlockSchema", () => {
  it("requires the end to come after the start", () => {
    const result = availabilityBlockSchema.safeParse({
      startDate: "2026-10-10",
      startTime: "14:00",
      endDate: "2026-10-10",
      endTime: "09:00",
      reason: "",
    });
    expect(result.success).toBe(false);
  });
});
