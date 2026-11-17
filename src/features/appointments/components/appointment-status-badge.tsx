import { StatusBadge, type StatusTone } from "@/components/status-badge";
import { APPOINTMENT_STATUS_LABELS } from "../labels";
import type { AppointmentStatus } from "../types";

const APPOINTMENT_STATUS_TONES = {
  scheduled: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "destructive",
  no_show: "destructive",
} as const satisfies Record<AppointmentStatus, StatusTone>;

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
};

export function AppointmentStatusBadge({
  status,
}: AppointmentStatusBadgeProps) {
  return (
    <StatusBadge tone={APPOINTMENT_STATUS_TONES[status]}>
      {APPOINTMENT_STATUS_LABELS[status]}
    </StatusBadge>
  );
}
