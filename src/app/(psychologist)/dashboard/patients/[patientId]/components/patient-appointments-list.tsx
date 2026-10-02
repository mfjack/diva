import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EmptyListMessage } from "@/components/feedback/empty-list-message";
import { AppointmentRow } from "@/features/appointments/components/appointment-row";
import type { Appointment } from "@/features/appointments/types";
import { formatTime, toAppTimeZone } from "@/lib/format";

type PatientAppointmentsListProps = {
  appointments: Appointment[];
};

export function PatientAppointmentsList({
  appointments,
}: PatientAppointmentsListProps) {
  if (appointments.length === 0) {
    return <EmptyListMessage message="Nenhuma sessão registrada." />;
  }

  return (
    <div className="divide-y rounded-xl border px-4">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="flex flex-col">
          <AppointmentRow
            appointment={appointment}
            isPaymentVisible
            isPatientNameVisible={false}
            leading={
              <span className="flex flex-col leading-tight">
                <span className="font-semibold tabular-nums">
                  {format(toAppTimeZone(appointment.startsAt), "dd/MM", {
                    locale: ptBR,
                  })}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {formatTime(appointment.startsAt)}
                </span>
              </span>
            }
          />
          {appointment.cancellation && (
            <p className="-mt-1 mb-3 ml-18 border-l-2 pl-3 text-muted-foreground text-sm">
              {appointment.cancellation.reason}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
