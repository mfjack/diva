import { EmptyListMessage } from "@/components/feedback/empty-list-message";
import { StatusBadge } from "@/components/status-badge";
import { CANCELLATION_ACTOR_LABELS } from "@/features/appointments/labels";
import type { Appointment } from "@/features/appointments/types";
import { formatDateTime } from "@/lib/format";

type CancellationListProps = {
  appointments: Appointment[];
};

export function CancellationList({ appointments }: CancellationListProps) {
  if (appointments.length === 0) {
    return <EmptyListMessage message="Nenhum cancelamento recente." />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {appointments.map(({ id, patientName, startsAt, cancellation }) => (
        <li key={id} className="flex flex-col gap-2 rounded-xl border p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{patientName}</span>
              <span className="text-muted-foreground text-xs">
                Sessão de {formatDateTime(startsAt)}
                {cancellation &&
                  `, cancelada ${CANCELLATION_ACTOR_LABELS[cancellation.cancelledBy]}`}
              </span>
            </div>
            {cancellation?.isLateCancellation && (
              <StatusBadge tone="warning">Em cima da hora</StatusBadge>
            )}
          </div>
          {cancellation && (
            <p className="border-l-2 pl-3 text-sm">{cancellation.reason}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
