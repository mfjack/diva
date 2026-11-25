import { CalendarDays } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import type {
  CalendarEvent,
  CalendarEventId,
} from "@/features/calendar-events/types";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  SCHEDULE_CARD_BADGE_CLASS_NAME,
  SCHEDULE_CARD_CLASS_NAME,
  SCHEDULE_CARD_TITLE_CLASS_NAME,
} from "./schedule-card-styles";

type CalendarEventCardProps = {
  event: CalendarEvent;
  onSelect: (eventId: CalendarEventId) => void;
};

export function CalendarEventCard({ event, onSelect }: CalendarEventCardProps) {
  function handleClick() {
    onSelect(event.id);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={event.title}
      className={cn(
        SCHEDULE_CARD_CLASS_NAME,
        "border-primary/30 border-dashed bg-background hover:border-primary",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm tabular-nums">
          {formatTime(event.startsAt)} – {formatTime(event.endsAt)}
        </span>
        <CalendarDays aria-hidden className="size-3.5 shrink-0 text-primary" />
      </span>
      <span className={SCHEDULE_CARD_TITLE_CLASS_NAME}>{event.title}</span>
      <StatusBadge tone="neutral" className={SCHEDULE_CARD_BADGE_CLASS_NAME}>
        Evento
      </StatusBadge>
    </button>
  );
}
