import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { bookAppointment } from "../actions";
import type { BookAppointmentInput } from "../schemas";

export function getBookAppointmentMutationKey() {
  return ["booking", "book"] as const;
}

export function useBookAppointmentMutation() {
  return useMutation({
    mutationKey: getBookAppointmentMutationKey(),
    mutationFn: async (input: BookAppointmentInput) =>
      unwrapActionResult(await bookAppointment(input)),
  });
}
