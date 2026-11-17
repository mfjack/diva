import "server-only";

import { getMockDatabase, type StoredPatient, saveMockDatabase } from "./store";

function withPaymentTerms(patient: StoredPatient): StoredPatient {
  patient.paymentPlan ??= "per_session";
  patient.billingDay ??= null;
  return patient;
}

export function listMockPatients(): StoredPatient[] {
  return getMockDatabase()
    .patients.filter(({ deletedAt }) => !deletedAt)
    .map(withPaymentTerms);
}

export function findMockPatient(patientId: string): StoredPatient | undefined {
  return listMockPatients().find(({ id }) => id === patientId);
}

export function insertMockPatient(patient: StoredPatient): void {
  getMockDatabase().patients.push(patient);
  saveMockDatabase();
}

export function updateMockPatient(
  patientId: string,
  changes: Partial<Omit<StoredPatient, "id">>,
): void {
  const patient = findMockPatient(patientId);
  if (!patient) return;
  Object.assign(patient, changes);
  saveMockDatabase();
}
