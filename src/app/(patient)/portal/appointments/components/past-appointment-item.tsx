import { AppointmentModalityLabel } from "@/features/appointments/components/appointment-row";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import { CANCELLATION_ACTOR_LABELS } from "@/features/appointments/labels";
import type { Appointment } from "@/features/appointments/types";
import { formatDate, formatTime } from "@/lib/format";

type PastAppointmentItemProps = {
  appointment: Appointment;
};

export function PastAppointmentItem({ appointment }: PastAppointmentItemProps) {
  return (
    <li className="flex flex-col gap-2 py-3.5">
      <div className="flex items-center gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
          <span className="font-medium tabular-nums">
            {formatDate(appointment.startsAt)} ·{" "}
            {formatTime(appointment.startsAt)}
          </span>
          <AppointmentModalityLabel modality={appointment.modality} />
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>
      {appointment.cancellation && (
        <p className="border-l-2 pl-3 text-muted-foreground text-sm">
          Cancelada{" "}
          {CANCELLATION_ACTOR_LABELS[appointment.cancellation.cancelledBy]}:{" "}
          {appointment.cancellation.reason}
        </p>
      )}
    </li>
  );
}
