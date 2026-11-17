import type { AppointmentModality } from "@/features/appointments/types";
import type { Brand } from "@/lib/brand";
import type { Cents } from "@/lib/money";
import type { Enums } from "@/lib/supabase/database.types";

export type PatientId = Brand<string, "PatientId">;

export type PatientStatus = Enums<"patient_status">;

export type Patient = {
  id: PatientId;
  fullName: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  cpf: string | null;
  status: PatientStatus;
  sessionPriceCents: Cents;
  preferredModality: AppointmentModality;
  healthInsurance: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  startedAt: string;
  nextAppointmentAt: string | null;
  completedSessionCount: number;
  pendingAmountCents: Cents;
};
