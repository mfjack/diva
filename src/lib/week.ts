import { addDaysToDateKey, getWeekdayOfDateKey, toDateKey } from "@/lib/dates";

const DAYS_IN_WEEK = 7;
const MAX_WEEK_OFFSET = 52;

export function parseWeekOffset(value: string | string[] | undefined): number {
  const parsedValue = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isInteger(parsedValue)) return 0;
  return Math.max(-MAX_WEEK_OFFSET, Math.min(MAX_WEEK_OFFSET, parsedValue));
}

export function getWeekDateKeys(
  weekOffset: number,
  now = new Date(),
): string[] {
  const todayKey = toDateKey(now);
  const daysSinceMonday = (getWeekdayOfDateKey(todayKey) + 6) % DAYS_IN_WEEK;
  const mondayKey = addDaysToDateKey(
    todayKey,
    weekOffset * DAYS_IN_WEEK - daysSinceMonday,
  );

  return Array.from({ length: DAYS_IN_WEEK }, (_, index) =>
    addDaysToDateKey(mondayKey, index),
  );
}
