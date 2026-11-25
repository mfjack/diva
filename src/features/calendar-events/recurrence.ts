import { addDaysToDateKey } from "@/lib/dates";

export const EVENT_REPEATS = ["none", "weekly", "biweekly"] as const;

export type EventRepeat = (typeof EVENT_REPEATS)[number];

export const MAX_EVENT_REPEAT_DAYS = 183;

const REPEAT_INTERVAL_DAYS = {
  weekly: 7,
  biweekly: 14,
} as const satisfies Record<Exclude<EventRepeat, "none">, number>;

export function planEventDateKeys(
  dateKey: string,
  repeat: EventRepeat,
  repeatUntil: string,
): string[] {
  if (repeat === "none" || !repeatUntil) return [dateKey];
  const dateKeys: string[] = [];
  for (
    let currentKey = dateKey;
    currentKey <= repeatUntil;
    currentKey = addDaysToDateKey(currentKey, REPEAT_INTERVAL_DAYS[repeat])
  ) {
    dateKeys.push(currentKey);
  }
  return dateKeys;
}
