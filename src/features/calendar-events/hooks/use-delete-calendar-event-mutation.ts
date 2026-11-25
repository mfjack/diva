import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { deleteCalendarEvent } from "../actions";
import type { DeleteCalendarEventInput } from "../schemas";
import type { CalendarEventId } from "../types";

type DeleteCalendarEventVariables = {
  eventId: CalendarEventId;
  input: DeleteCalendarEventInput;
};

export function getDeleteCalendarEventMutationKey() {
  return ["calendar-events", "delete"] as const;
}

export function useDeleteCalendarEventMutation() {
  return useMutation({
    mutationKey: getDeleteCalendarEventMutationKey(),
    mutationFn: async ({ eventId, input }: DeleteCalendarEventVariables) =>
      unwrapActionResult(await deleteCalendarEvent(eventId, input)),
  });
}
