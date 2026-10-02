"use client";

import { MapPin, Video } from "lucide-react";
import { memo } from "react";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import { APPOINTMENT_MODALITY_LABELS } from "@/features/appointments/labels";
import type { Appointment, AppointmentId } from "@/features/appointments/types";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type AppointmentCardProps = {
  appointment: Appointment;
  onSelect: (appointmentId: AppointmentId) => void;
};

export const AppointmentCard = memo(function AppointmentCard({
  appointment,
  onSelect,
}: AppointmentCardProps) {
  const isCancelled = appointment.status === "cancelled";
  const ModalityIcon = appointment.modality === "online" ? Video : MapPin;

  return (
    <button
      type="button"
      onClick={() => onSelect(appointment.id)}
      className={cn(
        "flex w-full flex-col gap-2 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-ring",
        isCancelled && "bg-muted/60",
      )}
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
});
