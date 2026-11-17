import "server-only";

import type { QueryData } from "@supabase/supabase-js";
import { cache } from "react";
import { z } from "zod";
import { recordAuditLog } from "@/features/audit/record-audit-log";
import { getCurrentUser } from "@/features/auth/queries";
import type { PatientId } from "@/features/patients/types";
import { assertNoDatabaseError } from "@/lib/supabase/errors";
import { createClient, type SupabaseServerClient } from "@/lib/supabase/server";
import { decryptClinicalContent } from "./content-encryption";
import { DOCUMENT_TEMPLATES } from "./document-templates";
import type {
  ClinicalRecord,
  ClinicalRecordId,
  ClinicalRecordSummary,
  DocumentTemplate,
  SessionNoteSummary,
} from "./types";

const RECORD_SUMMARY_COLUMNS = `
  id,
  patient_id,
  kind,
  title,
  created_at,
  updated_at,
  patient:patients!clinical_records_patient_id_fkey (full_name)
`;

const recordIdSchema = z.uuid();

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
    kind: row.kind,
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
    const parsedId = recordIdSchema.safeParse(recordId);
    const user = await getCurrentUser();
    if (!parsedId.success || !user) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("clinical_records")
      .select(`${RECORD_SUMMARY_COLUMNS}, encrypted_content`)
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
    };
  },
);

export async function hasClinicalRecord(recordId: string): Promise<boolean> {
  const parsedId = recordIdSchema.safeParse(recordId);
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

export async function listDocumentTemplates(): Promise<DocumentTemplate[]> {
  return DOCUMENT_TEMPLATES;
}

export async function listLatestSessionNotes(): Promise<SessionNoteSummary[]> {
  if (!(await getCurrentUser())) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinical_records")
    .select("id, patient_id, created_at")
    .eq("kind", "session_note")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  assertNoDatabaseError(error);

  const latestByPatient = new Map<string, SessionNoteSummary>();
  for (const note of data ?? []) {
    if (!latestByPatient.has(note.patient_id)) {
      latestByPatient.set(note.patient_id, {
        id: note.id as ClinicalRecordId,
        patientId: note.patient_id as PatientId,
        createdAt: note.created_at,
      });
    }
  }
  return [...latestByPatient.values()];
}
