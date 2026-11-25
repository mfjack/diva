import type { Brand } from "@/lib/brand";

export type CalendarEventId = Brand<string, "CalendarEventId">;

export type CalendarEventSeriesId = Brand<string, "CalendarEventSeriesId">;

export type CalendarEvent = {
  id: CalendarEventId;
  seriesId: CalendarEventSeriesId | null;
  title: string;
  notes: string | null;
  startsAt: string;
  endsAt: string;
};
