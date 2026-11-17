import { TZDate } from "@date-fns/tz";
import { addDays, format } from "date-fns";
import { APP_TIME_ZONE, toAppTimeZone } from "@/lib/format";

const DATE_KEY_FORMAT = "yyyy-MM-dd";

export function toDateKey(date: Date | string): string {
  return format(toAppTimeZone(date), DATE_KEY_FORMAT);
}

export function parseTime(time: string): { hours: number; minutes: number } {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return { hours, minutes };
}

export function zonedDateTime(dateKey: string, time: string): Date {
  const [year = 0, month = 1, day = 1] = dateKey.split("-").map(Number);
  const { hours, minutes } = parseTime(time);
  return new Date(
    new TZDate(
      year,
      month - 1,
      day,
      hours,
      minutes,
      0,
      APP_TIME_ZONE,
    ).getTime(),
  );
}

export function getWeekdayOfDateKey(dateKey: string): number {
  return zonedDateTime(dateKey, "12:00").getUTCDay();
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  return toDateKey(addDays(zonedDateTime(dateKey, "12:00"), days));
}

export function isSameDateKey(date: Date | string, dateKey: string): boolean {
  return toDateKey(date) === dateKey;
}

const LOCAL_DATE_KEY_FORMAT = "yyyy-MM-dd";

export function dateKeyToLocalDate(dateKey: string): Date {
  const [year = 1970, month = 1, day = 1] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function localDateToDateKey(date: Date): string {
  return format(date, LOCAL_DATE_KEY_FORMAT);
}

export function formatDateKey(dateKey: string): string {
  return format(dateKeyToLocalDate(dateKey), "dd/MM/yyyy");
}
