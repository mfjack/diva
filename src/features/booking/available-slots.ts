import type { AppointmentModality } from "@/features/appointments/types";
import type {
  AvailabilityBlock,
  AvailabilityRule,
} from "@/features/practice-settings/types";
import {
  addDaysToDateKey,
  getWeekdayOfDateKey,
  toDateKey,
  zonedDateTime,
} from "@/lib/dates";

const SLOT_ROUNDING_MINUTES = 30;
const MINUTE_IN_MS = 60_000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;

export type TimePeriod = {
  startsAt: string;
  endsAt: string;
};

export type AvailableSlot = TimePeriod & {
  modality: AppointmentModality | null;
};

export type SlotAvailabilityInput = {
  rules: readonly AvailabilityRule[];
  blocks: readonly AvailabilityBlock[];
  busyPeriods: readonly TimePeriod[];
  sessionDurationMinutes: number;
  minimumBookingNoticeHours: number;
  now: Date;
};

export function getSlotStepMinutes(sessionDurationMinutes: number): number {
  return (
    Math.ceil(sessionDurationMinutes / SLOT_ROUNDING_MINUTES) *
    SLOT_ROUNDING_MINUTES
  );
}

function overlaps(start: number, end: number, period: TimePeriod): boolean {
  return (
    start < new Date(period.endsAt).getTime() &&
    end > new Date(period.startsAt).getTime()
  );
}

export function getAvailableSlots(
  dateKey: string,
  {
    rules,
    blocks,
    busyPeriods,
    sessionDurationMinutes,
    minimumBookingNoticeHours,
    now,
  }: SlotAvailabilityInput,
): AvailableSlot[] {
  const weekday = getWeekdayOfDateKey(dateKey);
  const earliestStart = now.getTime() + minimumBookingNoticeHours * HOUR_IN_MS;
  const durationInMs = sessionDurationMinutes * MINUTE_IN_MS;
  const stepInMs = getSlotStepMinutes(sessionDurationMinutes) * MINUTE_IN_MS;
  const unavailablePeriods: readonly TimePeriod[] = [...blocks, ...busyPeriods];

  return rules
    .filter((rule) => rule.weekday === weekday)
    .flatMap((rule) => {
      const ruleEnd = zonedDateTime(dateKey, rule.endTime).getTime();
      const slots: AvailableSlot[] = [];

      for (
        let slotStart = zonedDateTime(dateKey, rule.startTime).getTime();
        slotStart + durationInMs <= ruleEnd;
        slotStart += stepInMs
      ) {
        const slotEnd = slotStart + durationInMs;
        const isTooSoon = slotStart < earliestStart;
        const isUnavailable = unavailablePeriods.some((period) =>
          overlaps(slotStart, slotEnd, period),
        );
        if (isTooSoon || isUnavailable) continue;

        slots.push({
          startsAt: new Date(slotStart).toISOString(),
          endsAt: new Date(slotEnd).toISOString(),
          modality: rule.modality,
        });
      }

      return slots;
    })
    .sort((first, second) => first.startsAt.localeCompare(second.startsAt));
}

export function getBookableDateKeys(
  bookingWindowDays: number,
  input: SlotAvailabilityInput,
): string[] {
  const todayKey = toDateKey(input.now);

  return Array.from({ length: bookingWindowDays + 1 }, (_, offset) =>
    addDaysToDateKey(todayKey, offset),
  ).filter((dateKey) => getAvailableSlots(dateKey, input).length > 0);
}
