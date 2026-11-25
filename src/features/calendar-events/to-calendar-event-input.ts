import { toDateKey } from "@/lib/dates";
import { formatTime } from "@/lib/format";
import type { CalendarEventInput } from "./schemas";
import type { CalendarEvent } from "./types";

export const EMPTY_CALENDAR_EVENT_INPUT: Partial<CalendarEventInput> = {
  title: "",
  date: "",
  notes: "",
  repeat: "none",
  repeatUntil: "",
};

export function toCalendarEventInput(event: CalendarEvent): CalendarEventInput {
  return {
    title: event.title,
    date: toDateKey(event.startsAt),
    startTime: formatTime(event.startsAt),
    endTime: formatTime(event.endsAt),
    notes: event.notes ?? "",
    repeat: "none",
    repeatUntil: "",
  };
}
