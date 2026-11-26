import "server-only";

import type { QueryData } from "@supabase/supabase-js";
import { cache } from "react";
import { z } from "zod";
import type { AppointmentId } from "@/features/appointments/types";
import { recordAuditLog } from "@/features/audit/record-audit-log";
import { getCurrentUser } from "@/features/auth/queries";
import type { PatientId } from "@/features/patients/types";
import {
  ATTACHMENT_COLUMNS,
  sortAttachments,
  toAttachment,
} from "@/lib/supabase/attachment-rows";
import { assertNoDatabaseError } from "@/lib/supabase/errors";
import { createClient, type SupabaseServerClient } from "@/lib/supabase/server";
import { decryptClinicalContent } from "./content-encryption";
import type {
  ClinicalRecord,
  ClinicalRecordAttachmentId,
  ClinicalRecordId,
  ClinicalRecordSummary,
  SessionNoteSummary,
  SessionOption,
} from "./types";

const RECORD_SUMMARY_COLUMNS = `
  id,
  patient_id,
  appointment_id,
  title,
  created_at,
  updated_at,
  patient:patients!clinical_records_patient_id_fkey (full_name),
  appointment:appointments!clinical_records_appointment_id_fkey (starts_at)
`;

const SESSION_OPTIONS_LIMIT = 60;

const entityIdSchema = z.uuid();

function selectRecordSummaries(supabase: SupabaseServerClient) {
  return supabase
    .from("clinical_records")
    .select(RECORD_SUMMARY_COLUMNS)
    .is("deleted_at", null);
}

type RecordSummaryRow = QueryData<
  ReturnType<typeof selectRecordSummaries>
>[number];

function toSummary(row: RecordSummaryRow): ClinicalRecordSummary {
  return {
    id: row.id as ClinicalRecordId,
    patientId: row.patient_id as PatientId,
    patientName: row.patient?.full_name ?? "",
    appointmentId: row.appointment_id as AppointmentId | null,
    sessionStartsAt: row.appointment?.starts_at ?? null,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listClinicalRecords(): Promise<ClinicalRecordSummary[]> {
  if (!(await getCurrentUser())) return [];
  const supabase = await createClient();
  const { data, error } = await selectRecordSummaries(supabase).order(
    "updated_at",
    { ascending: false },
  );
  assertNoDatabaseError(error);
  return (data ?? []).map(toSummary);
}

export async function listPatientClinicalRecords(
  patientId: PatientId,
): Promise<ClinicalRecordSummary[]> {
  if (!(await getCurrentUser())) return [];
  const supabase = await createClient();
  const { data, error } = await selectRecordSummaries(supabase)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  assertNoDatabaseError(error);
  return (data ?? []).map(toSummary);
}

export const getClinicalRecord = cache(
  async (recordId: string): Promise<ClinicalRecord | null> => {
    const parsedId = entityIdSchema.safeParse(recordId);
    const user = await getCurrentUser();
    if (!parsedId.success || !user) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("clinical_records")
      .select(
        `${RECORD_SUMMARY_COLUMNS}, encrypted_content, clinical_record_attachments (${ATTACHMENT_COLUMNS})`,
      )
      .eq("id", parsedId.data)
      .is("deleted_at", null)
      .maybeSingle();
    assertNoDatabaseError(error);
    if (!data) return null;

    await recordAuditLog({
      actorUserId: user.id,
      action: "clinical_record.viewed",
      entityType: "clinical_record",
      entityId: data.id,
    });
    return {
      ...toSummary(data),
      content: decryptClinicalContent(data.encrypted_content),
      attachments: sortAttachments(
        data.clinical_record_attachments.map(
          toAttachment<ClinicalRecordAttachmentId>,
        ),
      ),
    };
  },
);

export async function hasClinicalRecord(recordId: string): Promise<boolean> {
  const parsedId = entityIdSchema.safeParse(recordId);
  if (!parsedId.success) return false;
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("clinical_records")
    .select("id", { count: "exact", head: true })
    .eq("id", parsedId.data)
    .is("deleted_at", null);
  assertNoDatabaseError(error);
  return (count ?? 0) > 0;
}

export async function listSessionNotes(): Promise<SessionNoteSummary[]> {
  if (!(await getCurrentUser())) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinical_records")
    .select("id, patient_id, appointment_id, created_at")
    .not("appointment_id", "is", null)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  assertNoDatabaseError(error);
  return (data ?? []).map((note) => ({
    id: note.id as ClinicalRecordId,
    patientId: note.patient_id as PatientId,
    appointmentId: note.appointment_id as AppointmentId | null,
    createdAt: note.created_at,
  }));
}

export async function listPatientSessionOptions(
  patientId: string,
): Promise<SessionOption[]> {
  const parsedId = entityIdSchema.safeParse(patientId);
  if (!parsedId.success || !(await getCurrentUser())) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, starts_at")
    .eq("patient_id", parsedId.data)
    .neq("status", "cancelled")
    .order("starts_at", { ascending: false })
    .limit(SESSION_OPTIONS_LIMIT);
  assertNoDatabaseError(error);
  return (data ?? []).map((appointment) => ({
    appointmentId: appointment.id as AppointmentId,
    startsAt: appointment.starts_at,
  }));
}

export async function isPatientSession(
  patientId: PatientId,
  appointmentId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("id", appointmentId)
    .eq("patient_id", patientId);
  assertNoDatabaseError(error);
  return (count ?? 0) > 0;
}

export async function countClinicalRecordAttachments(
  recordId: string,
): Promise<number | null> {
  const parsedId = entityIdSchema.safeParse(recordId);
  if (!parsedId.success) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinical_records")
    .select("id, clinical_record_attachments (count)")
    .eq("id", parsedId.data)
    .is("deleted_at", null)
    .maybeSingle();
  assertNoDatabaseError(error);
  if (!data) return null;
  return data.clinical_record_attachments[0]?.count ?? 0;
}
