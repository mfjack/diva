import { MapPin, Video } from "lucide-react";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import { APPOINTMENT_MODALITY_LABELS } from "@/features/appointments/labels";
import type { Appointment, AppointmentId } from "@/features/appointments/types";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { APPOINTMENT_STATUS_SURFACE_CLASS_NAMES } from "./appointment-status-styles";
import {
  SCHEDULE_CARD_BADGE_CLASS_NAME,
  SCHEDULE_CARD_CLASS_NAME,
  SCHEDULE_CARD_TITLE_CLASS_NAME,
} from "./schedule-card-styles";

type AppointmentCardProps = {
  appointment: Appointment;
  onSelect: (appointmentId: AppointmentId) => void;
};

export function AppointmentCard({
  appointment,
  onSelect,
}: AppointmentCardProps) {
  const isCancelled = appointment.status === "cancelled";
  const ModalityIcon = appointment.modality === "online" ? Video : MapPin;

  function handleClick() {
    onSelect(appointment.id);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={appointment.patientName}
      className={cn(
        SCHEDULE_CARD_CLASS_NAME,
        APPOINTMENT_STATUS_SURFACE_CLASS_NAMES[appointment.status],
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-semibold text-sm tabular-nums",
            isCancelled && "text-muted-foreground line-through",
          )}
        >
          {formatTime(appointment.startsAt)}
        </span>
        <ModalityIcon
          aria-label={APPOINTMENT_MODALITY_LABELS[appointment.modality]}
          className="size-3.5 shrink-0 text-muted-foreground"
        />
      </span>
      <span
        className={cn(
          SCHEDULE_CARD_TITLE_CLASS_NAME,
          isCancelled && "text-destructive line-through",
        )}
      >
        {appointment.patientName}
      </span>
      <AppointmentStatusBadge
        status={appointment.status}
        className={SCHEDULE_CARD_BADGE_CLASS_NAME}
      />
    </button>
  );
}
