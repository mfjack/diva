import type { PatientStatus } from "./types";

export const PATIENT_STATUS_LABELS = {
  active: "Ativo",
  paused: "Pausado",
  discharged: "Alta",
} as const satisfies Record<PatientStatus, string>;
