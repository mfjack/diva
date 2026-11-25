import { CalendarCheck2, CalendarX2, Undo2, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { SESSION_SKIP_REASON_LABELS } from "@/features/appointments/labels";
import {
  listBookableSessions,
  type PlannedSession,
} from "@/features/appointments/recurring-sessions";
import { formatShortDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

function getSkipLabel({ skipReason, holidayName }: PlannedSession): string {
  if (skipReason === null) return "";
  if (skipReason === "holiday" && holidayName) {
    return `${SESSION_SKIP_REASON_LABELS.holiday} · ${holidayName}`;
  }
  return SESSION_SKIP_REASON_LABELS[skipReason];
}

export function countSessionsLabel(count: number): string {
  return count === 1 ? "1 sessão" : `${count} sessões`;
}

type SessionChipProps = {
  session: PlannedSession;
  isExcluded: boolean;
  onToggle: (dateKey: string) => void;
};

function SessionChip({ session, isExcluded, onToggle }: SessionChipProps) {
  const label = formatShortDate(session.startsAt);
  const isSkipped = session.skipReason !== null;

  if (isSkipped) {
    return (
      <li
        title={getSkipLabel(session)}
        className="flex h-7 items-center justify-center rounded-md bg-muted px-2 text-muted-foreground text-sm tabular-nums line-through"
      >
        {label}
      </li>
    );
  }

  const ToggleIcon = isExcluded ? Undo2 : X;
  return (
    <li
      className={cn(
        "flex h-7 items-center justify-between gap-1 rounded-md pr-1 pl-2 text-sm tabular-nums",
        isExcluded
          ? "bg-muted text-muted-foreground line-through"
          : "bg-primary/8 text-primary",
      )}
    >
      {label}
      <button
        type="button"
        aria-label={isExcluded ? `Voltar com ${label}` : `Tirar ${label}`}
        title={isExcluded ? "Voltar com a data" : "Tirar a data"}
        onClick={() => onToggle(session.dateKey)}
        className="flex size-5 items-center justify-center rounded hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ToggleIcon aria-hidden className="size-3" />
      </button>
    </li>
  );
}

type SessionPlanPreviewProps = {
  sessions: readonly PlannedSession[] | undefined;
  excludedDates: readonly string[];
  isLoading: boolean;
  onToggleDate: (dateKey: string) => void;
};

export function SessionPlanPreview({
  sessions,
  excludedDates,
  isLoading,
  onToggleDate,
}: SessionPlanPreviewProps) {
  if (!sessions) {
    return isLoading ? (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Spinner aria-hidden />
        Calculando as datas…
      </div>
    ) : null;
  }

  const selectedCount = listBookableSessions(sessions, excludedDates).length;
  const skippedSessions = sessions.filter(
    ({ skipReason }) => skipReason !== null,
  );
  const firstSession = sessions[0];

  return (
    <section
      aria-label="Datas da repetição"
      aria-busy={isLoading}
      className="flex flex-col gap-3 rounded-lg border p-3"
    >
      <p className="flex items-center gap-2 font-medium text-sm">
        <CalendarCheck2 aria-hidden className="size-4 text-primary" />
        {countSessionsLabel(selectedCount)}
        {firstSession && ` às ${formatTime(firstSession.startsAt)}`}
      </p>
      <ul className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto sm:grid-cols-3">
        {sessions.map((session) => (
          <SessionChip
            key={session.dateKey}
            session={session}
            isExcluded={excludedDates.includes(session.dateKey)}
            onToggle={onToggleDate}
          />
        ))}
      </ul>
      {skippedSessions.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm">
          {skippedSessions.map((session) => (
            <li
              key={session.dateKey}
              className="flex items-center gap-1.5 text-warning"
            >
              <CalendarX2 aria-hidden className="size-3.5 shrink-0" />
              {formatShortDate(session.startsAt)} · {getSkipLabel(session)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
