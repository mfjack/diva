import type { Appointment, AppointmentId } from "@/features/appointments/types";
import { cn } from "@/lib/utils";
import { PendingRequestItem } from "./pending-request-item";

type PendingRequestsProps = {
  appointments: readonly Appointment[];
  confirmingAppointmentId: AppointmentId | null;
  onConfirm: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  className?: string;
};

export function PendingRequests({
  appointments,
  confirmingAppointmentId,
  onConfirm,
  onCancel,
  className,
}: PendingRequestsProps) {
  return (
    <aside
      aria-labelledby="pending-requests-title"
      className={cn(
        "flex min-h-0 flex-col gap-4 rounded-xl border bg-card p-5",
        className,
      )}
    >
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 id="pending-requests-title" className="font-semibold">
            A confirmar
          </h2>
          <p className="text-muted-foreground text-xs">
            Sessões aguardando sua resposta
          </p>
        </div>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-warning/14 px-2 font-semibold text-warning text-xs">
          {appointments.length}
        </span>
      </header>

      <ul className="-mx-5 flex min-h-0 flex-col divide-y overflow-y-auto px-5">
        {appointments.map((appointment) => (
          <PendingRequestItem
            key={appointment.id}
            appointment={appointment}
            isConfirming={confirmingAppointmentId === appointment.id}
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        ))}
      </ul>
    </aside>
  );
}
