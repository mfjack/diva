import { getWeekdayOfDateKey } from "@/lib/dates";
import {
  MINUTES_PER_HOUR,
  minutesToTime,
  roundUpToFullHour,
  timeToMinutes,
} from "@/lib/time-slots";
import type { AvailabilityRule } from "./types";

export type SessionAvailability = {
  rules: readonly AvailabilityRule[];
  sessionDurationMinutes: number;
};

export function listAvailableTimes(
  { rules, sessionDurationMinutes }: SessionAvailability,
  dateKey: string,
): string[] {
  const weekday = getWeekdayOfDateKey(dateKey);
  const startMinutes = rules
    .filter((rule) => rule.weekday === weekday)
    .flatMap(({ startTime, endTime }) => {
      const lastStart = timeToMinutes(endTime) - sessionDurationMinutes;
      const starts: number[] = [];
      for (
        let minute = roundUpToFullHour(timeToMinutes(startTime));
        minute <= lastStart;
        minute += MINUTES_PER_HOUR
      ) {
        starts.push(minute);
      }
      return starts;
    });

  return [...new Set(startMinutes)]
    .sort((first, second) => first - second)
    .map(minutesToTime);
}

export function isWithinAvailability(
  availability: SessionAvailability,
  dateKey: string,
  time: string,
): boolean {
  const weekday = getWeekdayOfDateKey(dateKey);
  const start = timeToMinutes(time);
  const end = start + availability.sessionDurationMinutes;
  return availability.rules.some(
    (rule) =>
      rule.weekday === weekday &&
      timeToMinutes(rule.startTime) <= start &&
      timeToMinutes(rule.endTime) >= end,
  );
}
