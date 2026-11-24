"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  INVALID_FORM_MESSAGE,
  UNAUTHORIZED_MESSAGE,
} from "@/features/auth/errors";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import { isMonthlyPaymentPlan } from "@/features/payments/due-date";
import { getPracticeSettings } from "@/features/practice-settings/queries";
import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { type Cents, toCents } from "@/lib/money";
import { ROUTES } from "@/lib/routes";
import { emptyToNull } from "@/lib/strings";
import type { TablesUpdate } from "@/lib/supabase/database.types";
import {
  DATABASE_ERROR_CODES,
  hasDatabaseErrorCode,
} from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import { PATIENT_ACTION_MESSAGES } from "./messages";
import { type PatientInput, patientSchema } from "./schemas";
import type { PatientId } from "./types";

type PatientFields = Required<
  Omit<
    TablesUpdate<"patients">,
    | "id"
    | "psychologist_id"
    | "user_id"
    | "status"
    | "created_at"
    | "updated_at"
    | "deleted_at"
  >
>;

const patientIdSchema = z.uuid();

function revalidateDashboard(): void {
  revalidatePath(ROUTES.psychologist.dashboard, "layout");
}

function toPatientFields(
  input: PatientInput,
  defaultSessionPriceCents: Cents,
): PatientFields {
  return {
    full_name: input.fullName,
    email: emptyToNull(input.email),
    phone: emptyToNull(input.phone),
    cpf: emptyToNull(input.cpf),
    birth_date: emptyToNull(input.birthDate),
    session_price_cents:
      input.sessionPrice === undefined
        ? defaultSessionPriceCents
        : toCents(input.sessionPrice),
    preferred_modality: input.preferredModality,
    payment_plan: input.paymentPlan,
    billing_day: isMonthlyPaymentPlan(input.paymentPlan)
      ? (input.billingDay ?? null)
      : null,
    health_insurance: emptyToNull(input.healthInsurance),
    emergency_contact_name: emptyToNull(input.emergencyContactName),
    emergency_contact_phone: emptyToNull(input.emergencyContactPhone),
    notes: emptyToNull(input.notes),
  };
}

export async function savePatient(
  patientId: PatientId | null,
  input: PatientInput,
): Promise<ActionResult<{ id: PatientId }>> {
  const psychologist = await getAuthorizedPsychologist();
  if (!psychologist) return actionFailure(UNAUTHORIZED_MESSAGE);
  const parsedInput = patientSchema.safeParse(input);
  const parsedId = patientIdSchema.nullable().safeParse(patientId);
  if (!parsedInput.success || !parsedId.success) {
    return actionFailure(INVALID_FORM_MESSAGE);
  }

  const { defaultSessionPriceCents } = await getPracticeSettings();
  const fields = toPatientFields(parsedInput.data, defaultSessionPriceCents);
  const supabase = await createClient();

  if (parsedId.data) {
    const { data, error } = await supabase
      .from("patients")
      .update(fields)
      .eq("id", parsedId.data)
      .is("deleted_at", null)
      .select("id");
    if (error) return actionFailure(PATIENT_ACTION_MESSAGES.saveFailed);
    if (data.length === 0) {
      return actionFailure(PATIENT_ACTION_MESSAGES.notFound);
    }
    revalidateDashboard();
    return actionSuccess({ id: parsedId.data as PatientId });
  }

  const { data, error } = await supabase
    .from("patients")
    .insert({ ...fields, psychologist_id: psychologist.id })
    .select("id")
    .single();
  if (error) return actionFailure(PATIENT_ACTION_MESSAGES.saveFailed);
  revalidateDashboard();
  return actionSuccess({ id: data.id as PatientId });
}

export async function deletePatient(
  patientId: PatientId,
): Promise<ActionResult> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const parsedId = patientIdSchema.safeParse(patientId);
  if (!parsedId.success) return actionFailure(INVALID_FORM_MESSAGE);

  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_patient", {
    p_patient_id: parsedId.data,
    p_reason: PATIENT_ACTION_MESSAGES.removedReason,
  });
  if (hasDatabaseErrorCode(error, DATABASE_ERROR_CODES.notFound)) {
    return actionFailure(PATIENT_ACTION_MESSAGES.notFound);
  }
  if (error) return actionFailure(PATIENT_ACTION_MESSAGES.saveFailed);

  revalidateDashboard();
  return actionSuccess();
}
