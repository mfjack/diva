import { StatusBadge, type StatusTone } from "@/components/status-badge";
import { PATIENT_STATUS_LABELS } from "../labels";
import type { PatientStatus } from "../types";

const PATIENT_STATUS_TONES = {
  active: "success",
  paused: "warning",
  discharged: "neutral",
} as const satisfies Record<PatientStatus, StatusTone>;

type PatientStatusBadgeProps = {
  status: PatientStatus;
};

export function PatientStatusBadge({ status }: PatientStatusBadgeProps) {
  return (
    <StatusBadge tone={PATIENT_STATUS_TONES[status]}>
      {PATIENT_STATUS_LABELS[status]}
    </StatusBadge>
  );
}
