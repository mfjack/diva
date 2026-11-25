"use server";

import { revalidatePath } from "next/cache";
import { findAuthorizedEntity } from "@/features/auth/authorized-entity";
import {
  INVALID_FORM_MESSAGE,
  UNAUTHORIZED_MESSAGE,
} from "@/features/auth/errors";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { zonedDateTime } from "@/lib/dates";
import { ROUTES } from "@/lib/routes";
import { emptyToNull } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import { CALENDAR_EVENT_ACTION_MESSAGES } from "./messages";
import { getCalendarEvent } from "./queries";
import { planEventDateKeys } from "./recurrence";
import {
  type CalendarEventInput,
  calendarEventSchema,
  type DeleteCalendarEventInput,
  deleteCalendarEventSchema,
} from "./schemas";
import type { CalendarEventId } from "./types";

function findAuthorizedEvent(eventId: string) {
  return findAuthorizedEntity(
    eventId,
    getCalendarEvent,
    CALENDAR_EVENT_ACTION_MESSAGES.notFound,
  );
}

function revalidateSchedule(): void {
  revalidatePath(ROUTES.psychologist.schedule);
}

function toEventPeriod(dateKey: string, startTime: string, endTime: string) {
  return {
    starts_at: zonedDateTime(dateKey, startTime).toISOString(),
    ends_at: zonedDateTime(dateKey, endTime).toISOString(),
  };
}

export async function createCalendarEvent(
  input: CalendarEventInput,
): Promise<ActionResult<{ createdCount: number }>> {
  const psychologist = await getAuthorizedPsychologist();
  if (!psychologist) return actionFailure(UNAUTHORIZED_MESSAGE);
  const parsedInput = calendarEventSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const { title, notes, date, startTime, endTime, repeat, repeatUntil } =
    parsedInput.data;
  const dateKeys = planEventDateKeys(date, repeat, repeatUntil);
  const seriesId = dateKeys.length > 1 ? crypto.randomUUID() : null;
  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").insert(
    dateKeys.map((dateKey) => ({
      psychologist_id: psychologist.id,
      series_id: seriesId,
      title,
      notes: emptyToNull(notes),
      ...toEventPeriod(dateKey, startTime, endTime),
    })),
  );
  if (error) return actionFailure(CALENDAR_EVENT_ACTION_MESSAGES.saveFailed);

  revalidateSchedule();
  return actionSuccess({ createdCount: dateKeys.length });
}

export async function updateCalendarEvent(
  eventId: CalendarEventId,
  input: CalendarEventInput,
): Promise<ActionResult> {
  const lookup = await findAuthorizedEvent(eventId);
  if (!lookup.isFound) return lookup.failure;
  const parsedInput = calendarEventSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const { title, notes, date, startTime, endTime } = parsedInput.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("calendar_events")
    .update({
      title,
      notes: emptyToNull(notes),
      ...toEventPeriod(date, startTime, endTime),
    })
    .eq("id", lookup.entity.id);
  if (error) return actionFailure(CALENDAR_EVENT_ACTION_MESSAGES.saveFailed);

  revalidateSchedule();
  return actionSuccess();
}

export async function deleteCalendarEvent(
  eventId: CalendarEventId,
  input: DeleteCalendarEventInput,
): Promise<ActionResult> {
  const lookup = await findAuthorizedEvent(eventId);
  if (!lookup.isFound) return lookup.failure;
  const parsedInput = deleteCalendarEventSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const event = lookup.entity;
  const supabase = await createClient();
  const query = supabase.from("calendar_events").delete();
  const { error } =
    parsedInput.data.scope === "following" && event.seriesId
      ? await query
          .eq("series_id", event.seriesId)
          .gte("starts_at", event.startsAt)
      : await query.eq("id", event.id);
  if (error) return actionFailure(CALENDAR_EVENT_ACTION_MESSAGES.deleteFailed);

  revalidateSchedule();
  return actionSuccess();
}
