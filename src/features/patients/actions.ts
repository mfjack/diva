"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canChangeSchedule } from "@/features/appointments/status-transitions";
import {
  INVALID_FORM_MESSAGE,
  UNAUTHORIZED_MESSAGE,
} from "@/features/auth/errors";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import { getPracticeSettings } from "@/features/practice-settings/queries";
import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { toDateKey } from "@/lib/dates";
import { toCents } from "@/lib/money";
import { ROUTES } from "@/lib/routes";
import { emptyToNull } from "@/lib/strings";
import {
  listMockAppointments,
  updateMockAppointment,
} from "@/mocks/appointments";
import {
  findMockPatient,
  insertMockPatient,
  updateMockPatient,
} from "@/mocks/patients";
import {
  updateMockPendingPaymentDueDates,
  waiveMockPayment,
} from "@/mocks/payments";
import type { StoredPatient } from "@/mocks/store";
import { PATIENT_ACTION_MESSAGES } from "./messages";
import { type PatientInput, patientSchema } from "./schemas";
import type { PatientId } from "./types";

type PatientFields = Omit<StoredPatient, "id" | "status" | "startedAt">;

const patientIdSchema = z.string().min(1);

function toPatientFields(
  input: PatientInput,
  defaultSessionPriceCents: StoredPatient["sessionPriceCents"],
): PatientFields {
  return {
    fullName: input.fullName,
    email: emptyToNull(input.email),
    phone: emptyToNull(input.phone),
    cpf: emptyToNull(input.cpf),
    birthDate: emptyToNull(input.birthDate),
    sessionPriceCents:
      input.sessionPrice === undefined
        ? defaultSessionPriceCents
        : toCents(input.sessionPrice),
    preferredModality: input.preferredModality,
    healthInsurance: emptyToNull(input.healthInsurance),
    emergencyContactName: emptyToNull(input.emergencyContactName),
    emergencyContactPhone: emptyToNull(input.emergencyContactPhone),
    paymentPlan: input.paymentPlan,
    billingDay:
      input.paymentPlan === "monthly" ? (input.billingDay ?? null) : null,
    notes: emptyToNull(input.notes),
  };
}

export async function savePatient(
  patientId: PatientId | null,
  input: PatientInput,
): Promise<ActionResult<{ id: PatientId }>> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const parsedInput = patientSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const { defaultSessionPriceCents } = await getPracticeSettings();
  const fields = toPatientFields(parsedInput.data, defaultSessionPriceCents);

  if (patientId) {
    if (!findMockPatient(patientId)) {
      return actionFailure(PATIENT_ACTION_MESSAGES.notFound);
    }
    updateMockPatient(patientId, fields);
    updateMockPendingPaymentDueDates(patientId, fields);
    revalidatePath(ROUTES.psychologist.dashboard, "layout");
    return actionSuccess({ id: patientId });
  }

  const newPatientId = crypto.randomUUID() as PatientId;
  insertMockPatient({
    id: newPatientId,
    status: "active",
    startedAt: toDateKey(new Date()),
    ...fields,
  });
  revalidatePath(ROUTES.psychologist.dashboard, "layout");
  return actionSuccess({ id: newPatientId });
}

export async function deletePatient(
  patientId: PatientId,
): Promise<ActionResult> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const parsedId = patientIdSchema.safeParse(patientId);
  if (!parsedId.success) return actionFailure(INVALID_FORM_MESSAGE);
  if (!findMockPatient(parsedId.data)) {
    return actionFailure(PATIENT_ACTION_MESSAGES.notFound);
  }

  const now = new Date().toISOString();
  const openAppointments = listMockAppointments().filter(
    (appointment) =>
      appointment.patientId === parsedId.data && canChangeSchedule(appointment),
  );
  for (const appointment of openAppointments) {
    updateMockAppointment(appointment.id, {
      status: "cancelled",
      cancellation: {
        cancelledAt: now,
        cancelledBy: "psychologist",
        reason: PATIENT_ACTION_MESSAGES.removedReason,
        isLateCancellation: false,
      },
    });
    waiveMockPayment(appointment.id);
  }
  updateMockPatient(parsedId.data, { deletedAt: now });
  revalidatePath(ROUTES.psychologist.dashboard, "layout");
  return actionSuccess();
}
