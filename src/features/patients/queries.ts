import "server-only";

import { cache } from "react";
import { z } from "zod";
import { completeFinishedAppointments } from "@/features/appointments/finished-appointments";
import { getCurrentUser } from "@/features/auth/queries";
import { toDateKey } from "@/lib/dates";
import type { Cents } from "@/lib/money";
import type { Tables } from "@/lib/supabase/database.types";
import { assertNoDatabaseError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import type { Patient, PatientId } from "./types";

type PatientSummaryRow = Tables<"patient_summaries">;

const patientIdSchema = z.uuid();

function toPatient(row: PatientSummaryRow): Patient {
  return {
    id: row.id as PatientId,
    fullName: row.full_name ?? "",
    email: row.email,
    phone: row.phone,
    birthDate: row.birth_date,
    cpf: row.cpf,
    status: row.status ?? "active",
    sessionPriceCents: (row.session_price_cents ?? 0) as Cents,
    preferredModality: row.preferred_modality ?? "in_person",
    paymentPlan: row.payment_plan ?? "per_session",
    billingDay: row.billing_day,
    healthInsurance: row.health_insurance,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    notes: row.notes,
    startedAt: toDateKey(row.created_at ?? new Date()),
    nextAppointmentAt: row.next_appointment_at,
    completedSessionCount: row.completed_session_count ?? 0,
    pendingAmountCents: (row.pending_amount_cents ?? 0) as Cents,
  };
}

export const listPatients = cache(async (): Promise<Patient[]> => {
  if (!(await getCurrentUser())) return [];
  await completeFinishedAppointments();
  const supabase = await createClient();
  const { data, error } = await supabase.from("patient_summaries").select("*");
  assertNoDatabaseError(error);
  return (data ?? [])
    .map(toPatient)
    .sort((first, second) =>
      first.fullName.localeCompare(second.fullName, "pt-BR"),
    );
});

export const getPatient = cache(
  async (patientId: string): Promise<Patient | null> => {
    const parsedId = patientIdSchema.safeParse(patientId);
    if (!parsedId.success || !(await getCurrentUser())) return null;
    await completeFinishedAppointments();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("patient_summaries")
      .select("*")
      .eq("id", parsedId.data)
      .maybeSingle();
    assertNoDatabaseError(error);
    return data ? toPatient(data) : null;
  },
);
