"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAppointment } from "@/features/appointments/queries";
import type { AppointmentId } from "@/features/appointments/types";
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
import { registerMockPayment, undoMockPayment } from "@/mocks/payments";
import { PAYMENT_ACTION_MESSAGES } from "./messages";
import { type RegisterPaymentInput, registerPaymentSchema } from "./schemas";

const DEFAULT_PAYMENT_TIME = "12:00";

const appointmentIdSchema = z.string().min(1);

export async function registerPayment(
  appointmentId: AppointmentId,
  input: RegisterPaymentInput,
): Promise<ActionResult> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const parsedId = appointmentIdSchema.safeParse(appointmentId);
  const parsedInput = registerPaymentSchema.safeParse(input);
  if (!parsedId.success || !parsedInput.success) {
    return actionFailure(INVALID_FORM_MESSAGE);
  }

  const appointment = await getAppointment(parsedId.data);
  if (!appointment) {
    return actionFailure(PAYMENT_ACTION_MESSAGES.sessionNotFound);
  }
  if (appointment.paymentStatus !== "pending") {
    return actionFailure(PAYMENT_ACTION_MESSAGES.notPending);
  }

  registerMockPayment(appointment.id, {
    method: parsedInput.data.method,
    paidAt: zonedDateTime(
      parsedInput.data.paidOn,
      DEFAULT_PAYMENT_TIME,
    ).toISOString(),
  });
  revalidatePath(ROUTES.psychologist.dashboard, "layout");
  return actionSuccess();
}

export async function undoPayment(
  appointmentId: AppointmentId,
): Promise<ActionResult> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const parsedId = appointmentIdSchema.safeParse(appointmentId);
  if (!parsedId.success) return actionFailure(INVALID_FORM_MESSAGE);

  const appointment = await getAppointment(parsedId.data);
  if (!appointment) {
    return actionFailure(PAYMENT_ACTION_MESSAGES.sessionNotFound);
  }
  if (appointment.paymentStatus !== "paid") {
    return actionFailure(PAYMENT_ACTION_MESSAGES.notPaid);
  }

  undoMockPayment(appointment.id);
  revalidatePath(ROUTES.psychologist.dashboard, "layout");
  return actionSuccess();
}
