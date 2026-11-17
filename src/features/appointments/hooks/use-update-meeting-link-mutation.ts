import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { updateMeetingLink } from "../actions";
import type { MeetingLinkInput } from "../schemas";
import type { AppointmentId } from "../types";

type UpdateMeetingLinkVariables = {
  appointmentId: AppointmentId;
  input: MeetingLinkInput;
};

export function getUpdateMeetingLinkMutationKey() {
  return ["appointments", "meeting-link"] as const;
}

export function useUpdateMeetingLinkMutation() {
  return useMutation({
    mutationKey: getUpdateMeetingLinkMutationKey(),
    mutationFn: async ({ appointmentId, input }: UpdateMeetingLinkVariables) =>
      unwrapActionResult(await updateMeetingLink(appointmentId, input)),
  });
}
