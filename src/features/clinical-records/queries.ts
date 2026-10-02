import "server-only";

import type { PatientId } from "@/features/patients/types";
import {
  mockClinicalRecords,
  mockDocumentTemplates,
} from "@/mocks/clinical-records";
import type { ClinicalRecord, DocumentTemplate } from "./types";

export async function listClinicalRecords(): Promise<ClinicalRecord[]> {
  return [...mockClinicalRecords].sort((first, second) =>
    second.updatedAt.localeCompare(first.updatedAt),
  );
}

export async function listPatientClinicalRecords(
  patientId: PatientId,
): Promise<ClinicalRecord[]> {
  return mockClinicalRecords.filter((record) => record.patientId === patientId);
}

export async function getClinicalRecord(
  recordId: string,
): Promise<ClinicalRecord | null> {
  return mockClinicalRecords.find((record) => record.id === recordId) ?? null;
}

export async function listDocumentTemplates(): Promise<DocumentTemplate[]> {
  return mockDocumentTemplates;
}
