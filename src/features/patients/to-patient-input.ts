import { fromCents } from "@/lib/money";
import type { PatientInput } from "./schemas";
import type { Patient } from "./types";

export function toPatientInput(patient: Patient): PatientInput {
  return {
    fullName: patient.fullName,
    email: patient.email ?? "",
    phone: patient.phone ?? "",
    cpf: patient.cpf ?? "",
    birthDate: patient.birthDate ?? "",
    sessionPrice: fromCents(patient.sessionPriceCents),
    healthInsurance: patient.healthInsurance ?? "",
    emergencyContactName: patient.emergencyContactName ?? "",
    emergencyContactPhone: patient.emergencyContactPhone ?? "",
    notes: patient.notes ?? "",
  };
}
