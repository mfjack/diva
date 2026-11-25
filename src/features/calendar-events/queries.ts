import "server-only";

import { z } from "zod";
import { getCurrentUser } from "@/features/auth/queries";
import { addDaysToDateKey, zonedDateTime } from "@/lib/dates";
import type { Tables } from "@/lib/supabase/database.types";
import { assertNoDatabaseError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import type {
  CalendarEvent,
  CalendarEventId,
  CalendarEventSeriesId,
} from "./types";

const DAY_START_TIME = "00:00";

const eventIdSchema = z.uuid();

function toCalendarEvent(row: Tables<"calendar_events">): CalendarEvent {
  return {
    id: row.id as CalendarEventId,
    seriesId: row.series_id as CalendarEventSeriesId | null,
    title: row.title,
    notes: row.notes,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
  };
}

function getDayStart(dateKey: string): string {
  return zonedDateTime(dateKey, DAY_START_TIME).toISOString();
}

export async function listCalendarEventsBetween(
  startDateKey: string,
  endDateKey: string,
): Promise<CalendarEvent[]> {
  if (!(await getCurrentUser())) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .lt("starts_at", getDayStart(addDaysToDateKey(endDateKey, 1)))
    .gt("ends_at", getDayStart(startDateKey))
    .order("starts_at");
  assertNoDatabaseError(error);
  return (data ?? []).map(toCalendarEvent);
}

export async function getCalendarEvent(
  eventId: string,
): Promise<CalendarEvent | null> {
  const parsedId = eventIdSchema.safeParse(eventId);
  if (!parsedId.success || !(await getCurrentUser())) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("id", parsedId.data)
    .maybeSingle();
  assertNoDatabaseError(error);
  return data ? toCalendarEvent(data) : null;
}
