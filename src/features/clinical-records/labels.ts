import type { ClinicalRecordKind } from "./types";

export const CLINICAL_RECORD_KIND_LABELS = {
  session_note: "Evolução de sessão",
  report: "Laudo psicológico",
  certificate: "Atestado / declaração",
  referral: "Encaminhamento",
} as const satisfies Record<ClinicalRecordKind, string>;

export const CLINICAL_RECORD_KIND_OPTIONS = Object.entries(
  CLINICAL_RECORD_KIND_LABELS,
).map(([value, label]) => ({ value, label }));
