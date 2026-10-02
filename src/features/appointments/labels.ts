import type {
  AppointmentModality,
  AppointmentStatus,
  CancellationActor,
} from "./types";

export const APPOINTMENT_STATUS_LABELS = {
  scheduled: "Agendada",
  confirmed: "Confirmada",
  completed: "Realizada",
  cancelled: "Cancelada",
  no_show: "Falta",
} as const satisfies Record<AppointmentStatus, string>;

export const APPOINTMENT_MODALITY_LABELS = {
  in_person: "Presencial",
  online: "Online",
} as const satisfies Record<AppointmentModality, string>;

export const CANCELLATION_ACTOR_LABELS = {
  patient: "pelo paciente",
  psychologist: "pela psicóloga",
} as const satisfies Record<CancellationActor, string>;

export const CANCELLATION_REASONS = [
  { value: "health", label: "Problema de saúde" },
  { value: "work", label: "Compromisso de trabalho" },
  { value: "travel", label: "Viagem" },
  { value: "financial", label: "Questão financeira" },
  { value: "personal", label: "Motivo pessoal" },
  { value: "other", label: "Outro" },
] as const;

export type CancellationReasonValue =
  (typeof CANCELLATION_REASONS)[number]["value"];
