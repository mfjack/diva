import "server-only";

import { cache } from "react";
import { recordAuditLog } from "@/features/audit/record-audit-log";
import { getCurrentUser } from "@/features/auth/queries";
import type { PatientId } from "@/features/patients/types";
import {
  findMockClinicalRecord,
  listMockClinicalRecords,
} from "@/mocks/clinical-records";
import { DOCUMENT_TEMPLATES } from "@/mocks/document-templates";
import type {
  ClinicalRecord,
  ClinicalRecordSummary,
  DocumentTemplate,
  SessionNoteSummary,
} from "./types";

export async function listClinicalRecords(): Promise<ClinicalRecordSummary[]> {
  return [...listMockClinicalRecords()].sort((first, second) =>
    second.updatedAt.localeCompare(first.updatedAt),
  );
}

export async function listPatientClinicalRecords(
  patientId: PatientId,
): Promise<ClinicalRecordSummary[]> {
  return listMockClinicalRecords().filter(
    (record) => record.patientId === patientId,
  );
}

export const getClinicalRecord = cache(
  async (recordId: string): Promise<ClinicalRecord | null> => {
    const [record, user] = await Promise.all([
      findMockClinicalRecord(recordId) ?? null,
      getCurrentUser(),
    ]);
    if (record && user) {
      await recordAuditLog({
        actorUserId: user.id,
        action: "clinical_record.viewed",
        entityType: "clinical_record",
        entityId: record.id,
      });
    }
    return record;
  },
);

export async function listDocumentTemplates(): Promise<DocumentTemplate[]> {
  return DOCUMENT_TEMPLATES;
}

export async function listLatestSessionNotes(): Promise<SessionNoteSummary[]> {
  const latestByPatient = new Map<string, SessionNoteSummary>();
  for (const { id, patientId, createdAt, kind } of listMockClinicalRecords()) {
    const current = latestByPatient.get(patientId);
    if (
      kind === "session_note" &&
      (!current || createdAt > current.createdAt)
    ) {
      latestByPatient.set(patientId, { id, patientId, createdAt });
    }
  }
  return [...latestByPatient.values()];
}
