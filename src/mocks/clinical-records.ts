import "server-only";

import {
  decryptClinicalContent,
  encryptClinicalContent,
} from "@/features/clinical-records/content-encryption";
import type {
  ClinicalRecord,
  ClinicalRecordSummary,
} from "@/features/clinical-records/types";
import {
  getMockDatabase,
  type StoredClinicalRecord,
  saveMockDatabase,
} from "./store";

type ClinicalRecordChanges = Partial<Omit<ClinicalRecord, "id">>;

function toSummary({
  encryptedContent: _encryptedContent,
  ...summary
}: StoredClinicalRecord): ClinicalRecordSummary {
  return summary;
}

function toStoredChanges({
  content,
  ...changes
}: ClinicalRecordChanges): Partial<Omit<StoredClinicalRecord, "id">> {
  return content === undefined
    ? changes
    : { ...changes, encryptedContent: encryptClinicalContent(content) };
}

function findStoredRecord(recordId: string): StoredClinicalRecord | undefined {
  return getMockDatabase().clinicalRecords.find(({ id }) => id === recordId);
}

export function listMockClinicalRecords(): ClinicalRecordSummary[] {
  return getMockDatabase().clinicalRecords.map(toSummary);
}

export function findMockClinicalRecord(
  recordId: string,
): ClinicalRecord | undefined {
  const record = findStoredRecord(recordId);
  if (!record) return undefined;
  return {
    ...toSummary(record),
    content: decryptClinicalContent(record.encryptedContent),
  };
}

export function hasMockClinicalRecord(recordId: string): boolean {
  return findStoredRecord(recordId) !== undefined;
}

export function insertMockClinicalRecord({
  content,
  ...record
}: ClinicalRecord): void {
  getMockDatabase().clinicalRecords.push({
    ...record,
    encryptedContent: encryptClinicalContent(content),
  });
  saveMockDatabase();
}

export function updateMockClinicalRecord(
  recordId: string,
  changes: ClinicalRecordChanges,
): void {
  const record = findStoredRecord(recordId);
  if (!record) return;
  Object.assign(record, toStoredChanges(changes));
  saveMockDatabase();
}
