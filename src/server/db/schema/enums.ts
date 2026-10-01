import { pgEnum } from "drizzle-orm/pg-core";

export const USER_ROLES = ["psychologist", "patient"] as const;
export const APPOINTMENT_MODALITIES = ["in_person", "online"] as const;
export const APPOINTMENT_STATUSES = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;
export const CANCELLATION_ACTORS = ["patient", "psychologist"] as const;
export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "waived",
  "refunded",
] as const;
export const PAYMENT_METHODS = [
  "pix",
  "cash",
  "credit_card",
  "debit_card",
  "bank_transfer",
] as const;
export const CLINICAL_RECORD_KINDS = [
  "session_note",
  "report",
  "certificate",
  "referral",
] as const;
export const PATIENT_STATUSES = ["active", "paused", "discharged"] as const;

export const userRoleEnum = pgEnum("user_role", USER_ROLES);
export const appointmentModalityEnum = pgEnum(
  "appointment_modality",
  APPOINTMENT_MODALITIES,
);
export const appointmentStatusEnum = pgEnum(
  "appointment_status",
  APPOINTMENT_STATUSES,
);
export const cancellationActorEnum = pgEnum(
  "cancellation_actor",
  CANCELLATION_ACTORS,
);
export const paymentStatusEnum = pgEnum("payment_status", PAYMENT_STATUSES);
export const paymentMethodEnum = pgEnum("payment_method", PAYMENT_METHODS);
export const clinicalRecordKindEnum = pgEnum(
  "clinical_record_kind",
  CLINICAL_RECORD_KINDS,
);
export const patientStatusEnum = pgEnum("patient_status", PATIENT_STATUSES);
