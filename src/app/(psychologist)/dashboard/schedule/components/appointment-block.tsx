import { cva } from "class-variance-authority";
import { MapPin, Video } from "lucide-react";
import type { CSSProperties } from "react";
import { APPOINTMENT_MODALITY_LABELS } from "@/features/appointments/labels";
import type {
  Appointment,
  AppointmentId,
  AppointmentStatus,
} from "@/features/appointments/types";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const appointmentBlockVariants = cva(
  "flex min-w-0 flex-col justify-center gap-0.5 overflow-hidden rounded-md border px-2 py-1 text-left text-xs leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-ring",
  {
    variants: {
      status: {
        scheduled:
          "border-warning/60 border-dashed bg-warning/8 hover:bg-warning/14",
        confirmed:
          "border-primary/15 border-l-[3px] border-l-primary bg-primary/8 hover:bg-primary/14",
        completed:
          "border-success/15 border-l-[3px] border-l-success bg-success/8 hover:bg-success/14",
        no_show:
          "border-destructive/15 border-l-[3px] border-l-destructive bg-destructive/6 hover:bg-destructive/10",
        cancelled:
          "border-dashed bg-background text-muted-foreground hover:bg-muted",
      } satisfies Record<AppointmentStatus, string>,
    },
  },
);

type AppointmentBlockProps = {
  appointment: Appointment;
  onSelect: (appointmentId: AppointmentId) => void;
  className?: string;
  style?: CSSProperties;
};

export function AppointmentBlock({
  appointment,
  onSelect,
  className,
  style,
}: AppointmentBlockProps) {
  const ModalityIcon = appointment.modality === "online" ? Video : MapPin;
  const isCancelled = appointment.status === "cancelled";

  function handleClick() {
    onSelect(appointment.id);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={style}
      className={cn(
        appointmentBlockVariants({ status: appointment.status }),
        className,
      )}
    >
      <span
        className={cn(
          "truncate font-medium text-foreground",
          isCancelled && "text-muted-foreground line-through",
        )}
      >
        {appointment.patientName}
      </span>
      <span className="flex items-center gap-1 text-muted-foreground tabular-nums">
        {formatTime(appointment.startsAt)} – {formatTime(appointment.endsAt)}
        <ModalityIcon
          aria-label={APPOINTMENT_MODALITY_LABELS[appointment.modality]}
          className="size-3 shrink-0"
        />
      </span>
    </button>
  );
}
