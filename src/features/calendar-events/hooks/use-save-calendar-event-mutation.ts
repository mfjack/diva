import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { createCalendarEvent, updateCalendarEvent } from "../actions";
import type { CalendarEventInput } from "../schemas";
import type { CalendarEventId } from "../types";

type SaveCalendarEventVariables = {
  eventId: CalendarEventId | null;
  input: CalendarEventInput;
};

export function getSaveCalendarEventMutationKey() {
  return ["calendar-events", "save"] as const;
}

export function useSaveCalendarEventMutation() {
  return useMutation({
    mutationKey: getSaveCalendarEventMutationKey(),
    mutationFn: async ({ eventId, input }: SaveCalendarEventVariables) => {
      if (!eventId) return unwrapActionResult(await createCalendarEvent(input));
      unwrapActionResult(await updateCalendarEvent(eventId, input));
      return { createdCount: 0 };
    },
  });
}
