import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EmptyListMessage } from "@/components/feedback/empty-list-message";
import { AppointmentModalityLabel } from "@/features/appointments/components/appointment-modality-label";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import type { Appointment } from "@/features/appointments/types";
import { formatTime, toAppTimeZone } from "@/lib/format";
import { cn } from "@/lib/utils";

type PatientAppointmentsListProps = {
  appointments: Appointment[];
};

type PatientAppointmentItemProps = {
  appointment: Appointment;
};

function PatientAppointmentItem({ appointment }: PatientAppointmentItemProps) {
  const startsAt = toAppTimeZone(appointment.startsAt);
  const isCancelled = appointment.status === "cancelled";

  return (
    <li className="flex items-center gap-4 py-3 text-sm">
      <div
        className={cn(
          "flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted leading-tight",
          isCancelled && "text-muted-foreground",
        )}
      >
        <span className="font-semibold text-sm tabular-nums">
          {format(startsAt, "d")}
        </span>
        <span className="text-sm">
          {format(startsAt, "MMM", { locale: ptBR })}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "font-medium first-letter:uppercase",
            isCancelled && "text-muted-foreground",
          )}
        >
          {format(startsAt, "EEEE", { locale: ptBR })}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground text-sm tabular-nums">
          {formatTime(appointment.startsAt)} – {formatTime(appointment.endsAt)}
          <AppointmentModalityLabel
            modality={appointment.modality}
            isTextHidden
            className="text-sm"
          />
        </span>
        {appointment.cancellation?.reason && (
          <span className="truncate text-muted-foreground text-sm">
            Motivo: {appointment.cancellation.reason}
          </span>
        )}
      </div>
      <AppointmentStatusBadge status={appointment.status} />
    </li>
  );
}

export function PatientAppointmentsList({
  appointments,
}: PatientAppointmentsListProps) {
  if (appointments.length === 0) {
    return <EmptyListMessage message="Nenhuma sessão registrada." />;
  }

  return (
    <ul className="divide-y rounded-xl border px-4">
      {appointments.map((appointment) => (
        <PatientAppointmentItem
          key={appointment.id}
          appointment={appointment}
        />
      ))}
    </ul>
  );
}
