import type { SessionRepeat, SessionSkipReason } from "./recurring-sessions";
import type {
  AppointmentModality,
  AppointmentStatus,
  CancellationActor,
} from "./types";

export const APPOINTMENT_STATUS_LABELS = {
  scheduled: "A confirmar",
  confirmed: "Confirmada",
  completed: "Realizada",
  cancelled: "Cancelada",
  no_show: "Falta",
} as const satisfies Record<AppointmentStatus, string>;

export const APPOINTMENT_MODALITY_LABELS = {
  in_person: "Presencial",
  online: "Online",
} as const satisfies Record<AppointmentModality, string>;

export const APPOINTMENT_MODALITY_OPTIONS = Object.entries(
  APPOINTMENT_MODALITY_LABELS,
).map(([value, label]) => ({ value, label }));

export const CANCELLATION_ACTOR_LABELS = {
  patient: "pelo paciente",
  psychologist: "pelo consultório",
} as const satisfies Record<CancellationActor, string>;

export const CANCELLATION_REASONS = [
  { value: "health", label: "Problema de saúde" },
  { value: "work", label: "Compromisso de trabalho" },
  { value: "travel", label: "Viagem" },
  { value: "financial", label: "Questão financeira" },
  { value: "personal", label: "Motivo pessoal" },
  { value: "other", label: "Outro" },
] as const;

export const SESSION_REPEAT_OPTIONS = [
  { value: "none", label: "Não repetir" },
  { value: "weekly", label: "Toda semana" },
  { value: "biweekly", label: "A cada 2 semanas" },
] as const satisfies readonly { value: SessionRepeat; label: string }[];

export const SESSION_SKIP_REASON_LABELS = {
  past: "Horário já passou",
  unavailable: "Fora do horário de atendimento",
  conflict: "Horário ocupado",
  holiday: "Feriado",
  blocked: "Agenda bloqueada",
} as const satisfies Record<SessionSkipReason, string>;

export const CANCELLATION_SCOPE_OPTIONS = [
  { value: "single", label: "Só esta sessão" },
  {
    value: "following",
    label: "Esta e as próximas",
    description: "Cancela as sessões seguintes que foram agendadas juntas.",
  },
] as const;
