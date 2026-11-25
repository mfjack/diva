import { addDaysToDateKey, getWeekdayOfDateKey, toDateKey } from "@/lib/dates";
import { addMonthsToMonthKey, getMonthRange, toMonthKey } from "@/lib/months";

const DAYS_IN_WEEK = 7;
const MAX_CALENDAR_OFFSET = 52;

export type MonthWeeks = {
  monthKey: string;
  weeks: string[][];
};

export function parseCalendarOffset(
  value: string | string[] | undefined,
): number {
  const parsedValue = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isInteger(parsedValue)) return 0;
  return Math.max(
    -MAX_CALENDAR_OFFSET,
    Math.min(MAX_CALENDAR_OFFSET, parsedValue),
  );
}

function getMondayKey(dateKey: string): string {
  const daysSinceMonday = (getWeekdayOfDateKey(dateKey) + 6) % DAYS_IN_WEEK;
  return addDaysToDateKey(dateKey, -daysSinceMonday);
}

function listWeekDateKeys(mondayKey: string): string[] {
  return Array.from({ length: DAYS_IN_WEEK }, (_, index) =>
    addDaysToDateKey(mondayKey, index),
  );
}

export function getWeekDateKeys(
  weekOffset: number,
  now = new Date(),
): string[] {
  return listWeekDateKeys(
    addDaysToDateKey(getMondayKey(toDateKey(now)), weekOffset * DAYS_IN_WEEK),
  );
}

export function getWeekOffsetOfDateKey(
  dateKey: string,
  now = new Date(),
): number {
  const currentMondayKey = getMondayKey(toDateKey(now));
  const targetMondayKey = getMondayKey(dateKey);
  const dayDifference =
    (Date.parse(targetMondayKey) - Date.parse(currentMondayKey)) / 86_400_000;
  return Math.round(dayDifference / DAYS_IN_WEEK);
}

export function getMonthWeeks(
  monthOffset: number,
  now = new Date(),
): MonthWeeks {
  const monthKey = addMonthsToMonthKey(toMonthKey(toDateKey(now)), monthOffset);
  const { startKey, endKey } = getMonthRange(monthKey);
  const weeks: string[][] = [];
  for (
    let mondayKey = getMondayKey(startKey);
    mondayKey <= endKey;
    mondayKey = addDaysToDateKey(mondayKey, DAYS_IN_WEEK)
  ) {
    weeks.push(listWeekDateKeys(mondayKey));
  }
  return { monthKey, weeks };
}
