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
  className?: string;
};

export function AppointmentStatusBadge({
  status,
  className,
}: AppointmentStatusBadgeProps) {
  return (
    <StatusBadge tone={APPOINTMENT_STATUS_TONES[status]} className={className}>
      {APPOINTMENT_STATUS_LABELS[status]}
    </StatusBadge>
  );
}
