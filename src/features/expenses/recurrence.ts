import { addMonths, addWeeks } from "date-fns";
import { dateKeyToLocalDate, localDateToDateKey } from "@/lib/dates";
import type { Expense } from "./types";

export type ExpenseSchedule = Pick<
  Expense,
  "recurrence" | "startsOn" | "endsOn" | "installmentCount"
>;

export type ExpenseOccurrenceEntry = {
  dueOn: string;
  number: number;
};

const ADD_INTERVAL = {
  weekly: addWeeks,
  monthly: addMonths,
  installments: addMonths,
} as const;

function getOccurrence(
  { recurrence, startsOn }: ExpenseSchedule,
  index: number,
): string {
  if (recurrence === "once") return startsOn;
  return localDateToDateKey(
    ADD_INTERVAL[recurrence](dateKeyToLocalDate(startsOn), index),
  );
}

function getOccurrenceLimit({
  recurrence,
  installmentCount,
}: ExpenseSchedule): number {
  if (recurrence === "once") return 1;
  if (recurrence === "installments") return installmentCount ?? 1;
  return Number.POSITIVE_INFINITY;
}

function isAfterEnd({ endsOn }: ExpenseSchedule, occurrence: string): boolean {
  return endsOn !== null && occurrence > endsOn;
}

export function listOccurrenceEntriesBetween(
  schedule: ExpenseSchedule,
  fromKey: string,
  untilKey: string,
): ExpenseOccurrenceEntry[] {
  const limit = getOccurrenceLimit(schedule);
  const entries: ExpenseOccurrenceEntry[] = [];
  for (let index = 0; index < limit; index += 1) {
    const dueOn = getOccurrence(schedule, index);
    if (dueOn > untilKey || isAfterEnd(schedule, dueOn)) break;
    if (dueOn >= fromKey) entries.push({ dueOn, number: index + 1 });
  }
  return entries;
}

export function listOccurrencesBetween(
  schedule: ExpenseSchedule,
  fromKey: string,
  untilKey: string,
): string[] {
  return listOccurrenceEntriesBetween(schedule, fromKey, untilKey).map(
    ({ dueOn }) => dueOn,
  );
}

export function isOccurrenceOf(
  schedule: ExpenseSchedule,
  dueOn: string,
): boolean {
  return listOccurrencesBetween(schedule, dueOn, dueOn).length === 1;
}

export function canEndRecurrence(
  { recurrence, startsOn, endsOn }: ExpenseSchedule,
  todayKey: string,
): boolean {
  return recurrence !== "once" && endsOn === null && startsOn <= todayKey;
}
