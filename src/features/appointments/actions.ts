"use server";

import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import {
  type AppointmentStatusUpdate,
  appointmentStatusUpdateSchema,
  type CancelAppointmentInput,
  type CreateAppointmentInput,
  cancelAppointmentSchema,
  createAppointmentSchema,
  formatCancellationReason,
} from "./schemas";
import type { AppointmentId } from "./types";

const INVALID_FORM_MESSAGE = "Confira os campos destacados.";

export async function cancelAppointment(
  _appointmentId: AppointmentId,
  input: CancelAppointmentInput,
): Promise<ActionResult<{ reason: string }>> {
  const parsedInput = cancelAppointmentSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  return actionSuccess({ reason: formatCancellationReason(parsedInput.data) });
}

export async function updateAppointmentStatus(
  _appointmentId: AppointmentId,
  status: AppointmentStatusUpdate,
): Promise<ActionResult> {
  const parsedStatus = appointmentStatusUpdateSchema.safeParse(status);
  if (!parsedStatus.success) return actionFailure("Status inválido.");

  return actionSuccess();
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<ActionResult> {
  const parsedInput = createAppointmentSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  return actionSuccess();
}
