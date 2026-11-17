"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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
import {
  DATABASE_ERROR_CODES,
  hasDatabaseErrorCode,
} from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import { PAYMENT_ACTION_MESSAGES } from "./messages";
import { type RegisterPaymentInput, registerPaymentSchema } from "./schemas";

const DEFAULT_PAYMENT_TIME = "12:00";

const appointmentIdSchema = z.uuid();

function getPaymentFailure(
  error: { code?: string },
  ruleViolationMessage: string,
): string {
  return hasDatabaseErrorCode(error, DATABASE_ERROR_CODES.ruleViolation)
    ? ruleViolationMessage
    : PAYMENT_ACTION_MESSAGES.saveFailed;
}

function revalidateDashboard(): void {
  revalidatePath(ROUTES.psychologist.dashboard, "layout");
}

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

  const { method, paidOn, notes } = parsedInput.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("register_payment", {
    p_appointment_id: parsedId.data,
    p_method: method,
    p_paid_at: zonedDateTime(paidOn, DEFAULT_PAYMENT_TIME).toISOString(),
    p_notes: notes,
  });
  if (error) {
    return actionFailure(
      getPaymentFailure(error, PAYMENT_ACTION_MESSAGES.notPending),
    );
  }

  revalidateDashboard();
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

  const supabase = await createClient();
  const { error } = await supabase.rpc("undo_payment", {
    p_appointment_id: parsedId.data,
  });
  if (error) {
    return actionFailure(
      getPaymentFailure(error, PAYMENT_ACTION_MESSAGES.notPaid),
    );
  }

  revalidateDashboard();
  return actionSuccess();
}
