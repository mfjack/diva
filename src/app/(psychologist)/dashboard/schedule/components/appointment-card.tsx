import { cva } from "class-variance-authority";
import { MapPin, Video } from "lucide-react";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import { APPOINTMENT_MODALITY_LABELS } from "@/features/appointments/labels";
import type {
  Appointment,
  AppointmentId,
  AppointmentStatus,
} from "@/features/appointments/types";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const appointmentCardVariants = cva(
  "flex w-full flex-col gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring",
  {
    variants: {
      status: {
        scheduled: "border-warning/20 bg-warning/5 hover:border-warning",
        confirmed: "border-primary/15 bg-primary/4 hover:border-primary",
        completed: "border-success/20 bg-success/5 hover:border-success",
        no_show:
          "border-destructive/15 bg-destructive/4 hover:border-destructive",
        cancelled: "bg-muted/40 hover:border-muted-foreground",
      } satisfies Record<AppointmentStatus, string>,
    },
  },
);

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
      className={appointmentCardVariants({ status: appointment.status })}
    >
      <div className="flex items-center justify-between gap-2">
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
          className="size-3.5 text-muted-foreground"
        />
      </div>
      <span
        className={cn(
          "line-clamp-2 font-medium text-sm leading-snug",
          isCancelled && "text-muted-foreground",
        )}
      >
        {appointment.patientName}
      </span>
      <AppointmentStatusBadge status={appointment.status} />
    </button>
  );
}
