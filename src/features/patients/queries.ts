import "server-only";

import { findMockPatient, mockPatients } from "@/mocks/patients";
import type { Patient } from "./types";

export async function listPatients(): Promise<Patient[]> {
  return [...mockPatients].sort((first, second) =>
    first.fullName.localeCompare(second.fullName, "pt-BR"),
  );
}

export async function getPatient(patientId: string): Promise<Patient | null> {
  return findMockPatient(patientId) ?? null;
}
