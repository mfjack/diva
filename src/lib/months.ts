import { addMonths, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { dateKeyToLocalDate, localDateToDateKey, toDateKey } from "./dates";

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const MONTH_KEY_LENGTH = 7;

export type MonthRange = {
  monthKey: string;
  startKey: string;
  endKey: string;
};

function getFirstDayKey(monthKey: string): string {
  return `${monthKey}-01`;
}

export function toMonthKey(dateKey: string): string {
  return dateKey.slice(0, MONTH_KEY_LENGTH);
}

export function getCurrentMonthKey(now: Date = new Date()): string {
  return toMonthKey(toDateKey(now));
}

export function isMonthKey(value: string | undefined): value is string {
  return value !== undefined && MONTH_KEY_PATTERN.test(value);
}

export function getMonthRange(monthKey: string): MonthRange {
  const startKey = getFirstDayKey(monthKey);
  return {
    monthKey,
    startKey,
    endKey: localDateToDateKey(endOfMonth(dateKeyToLocalDate(startKey))),
  };
}

export function isDateKeyInRange(
  dateKey: string,
  { startKey, endKey }: MonthRange,
): boolean {
  return dateKey >= startKey && dateKey <= endKey;
}

export function addMonthsToMonthKey(monthKey: string, amount: number): string {
  return toMonthKey(
    localDateToDateKey(
      addMonths(dateKeyToLocalDate(getFirstDayKey(monthKey)), amount),
    ),
  );
}

export function formatMonthLabel(monthKey: string): string {
  const label = format(
    dateKeyToLocalDate(getFirstDayKey(monthKey)),
    "MMMM 'de' yyyy",
    { locale: ptBR },
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}
