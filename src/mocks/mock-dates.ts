import { addDaysToDateKey, toDateKey, zonedDateTime } from "@/lib/dates";

const todayKey = toDateKey(new Date());

export function mockDateKey(dayOffset: number): string {
  return addDaysToDateKey(todayKey, dayOffset);
}

export function mockDateTime(dayOffset: number, time: string): string {
  return zonedDateTime(mockDateKey(dayOffset), time).toISOString();
}

export function mockSessionEnd(startsAt: string, durationMinutes = 50) {
  return new Date(
    new Date(startsAt).getTime() + durationMinutes * 60_000,
  ).toISOString();
}
