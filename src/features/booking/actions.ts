"use server";

import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { type BookAppointmentInput, bookAppointmentSchema } from "./schemas";

export async function bookAppointment(
  input: BookAppointmentInput,
): Promise<ActionResult> {
  const parsedInput = bookAppointmentSchema.safeParse(input);
  if (!parsedInput.success) {
    return actionFailure("Escolha um horário e a modalidade.");
  }

  return actionSuccess();
}
