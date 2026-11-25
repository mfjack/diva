import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Appointment, AppointmentId } from "@/features/appointments/types";
import type {
  CalendarEvent,
  CalendarEventId,
} from "@/features/calendar-events/types";
import { toDateKey, zonedDateTime } from "@/lib/dates";
import { formatTime } from "@/lib/format";
import { getHoliday } from "@/lib/holidays";
import { toMonthKey } from "@/lib/months";
import { cn } from "@/lib/utils";
import { getWeekOffsetOfDateKey } from "@/lib/week";
import {
  buildScheduleHref,
  listDayItems,
  type ScheduleItem,
} from "../schedule-layout";
import { APPOINTMENT_STATUS_SURFACE_CLASS_NAMES } from "./appointment-status-styles";
import { getDayLabel } from "./day-heading";

const MAX_VISIBLE_ITEMS = 3;

const CHIP_CLASS_NAME =
  "flex h-6 w-full min-w-0 items-center gap-1 rounded border px-1.5 text-left text-sm leading-none transition-colors focus-visible:outline-2 focus-visible:outline-ring";

const EVENT_CHIP_CLASS_NAME =
  "border-primary/30 border-dashed bg-background hover:border-primary";

type MonthGridProps = {
  monthKey: string;
  weeks: readonly (readonly string[])[];
  appointments: readonly Appointment[];
  events: readonly CalendarEvent[];
  now: string;
  onSelect: (appointmentId: AppointmentId) => void;
  onSelectEvent: (eventId: CalendarEventId) => void;
  className?: string;
};

type MonthDayProps = {
  dateKey: string;
  isOutsideMonth: boolean;
  isToday: boolean;
  weekHref: string;
  items: readonly ScheduleItem[];
  onSelect: (appointmentId: AppointmentId) => void;
  onSelectEvent: (eventId: CalendarEventId) => void;
};

type MonthItemChipProps = {
  item: ScheduleItem;
  onSelect: (appointmentId: AppointmentId) => void;
  onSelectEvent: (eventId: CalendarEventId) => void;
};

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

function formatItemCount(count: number): string {
  return count === 1 ? "1 compromisso" : `${count} compromissos`;
}

function MonthItemChip({ item, onSelect, onSelectEvent }: MonthItemChipProps) {
  if (item.kind === "event") {
    return (
      <button
        type="button"
        onClick={() => onSelectEvent(item.event.id)}
        title={`${formatTime(item.startsAt)} – ${formatTime(item.event.endsAt)} · ${item.event.title}`}
        className={cn(CHIP_CLASS_NAME, EVENT_CHIP_CLASS_NAME)}
      >
        <span className="shrink-0 font-semibold tabular-nums">
          {formatTime(item.startsAt)}
        </span>
        <span className="truncate">{item.event.title}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(item.appointment.id)}
      title={`${formatTime(item.startsAt)} · ${item.appointment.patientName}`}
      className={cn(
        CHIP_CLASS_NAME,
        APPOINTMENT_STATUS_SURFACE_CLASS_NAMES[item.appointment.status],
      )}
    >
      <span className="shrink-0 font-semibold tabular-nums">
        {formatTime(item.startsAt)}
      </span>
      <span
        className={cn(
          "truncate",
          item.appointment.status === "cancelled" &&
            "text-destructive line-through",
        )}
      >
        {getFirstName(item.appointment.patientName)}
      </span>
    </button>
  );
}

function MonthDay({
  dateKey,
  isOutsideMonth,
  isToday,
  weekHref,
  items,
  onSelect,
  onSelectEvent,
}: MonthDayProps) {
  const holiday = getHoliday(dateKey);
  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <section
      aria-label={getDayLabel(dateKey)}
      className={cn(
        "flex min-h-20 min-w-0 flex-col gap-1 bg-card p-1.5 lg:min-h-28",
        isOutsideMonth && "bg-muted/40",
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <Link
          href={weekHref}
          aria-label={`Abrir a semana de ${getDayLabel(dateKey)}`}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full font-semibold text-sm leading-none tabular-nums hover:bg-muted",
            isOutsideMonth && "text-muted-foreground",
            isToday && "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {format(zonedDateTime(dateKey, "12:00"), "d")}
        </Link>
        {holiday && (
          <span
            title={holiday.name}
            className="hidden min-w-0 truncate text-sm text-warning lg:inline"
          >
            {holiday.name}
          </span>
        )}
      </div>

      {items.length > 0 && (
        <Link
          href={weekHref}
          className="w-fit rounded bg-primary/10 px-1.5 py-0.5 font-medium text-sm text-primary lg:hidden"
        >
          {formatItemCount(items.length)}
        </Link>
      )}

      <ul className="hidden flex-col gap-1 lg:flex">
        {visibleItems.map((item) => (
          <li key={item.kind === "event" ? item.event.id : item.appointment.id}>
            <MonthItemChip
              item={item}
              onSelect={onSelect}
              onSelectEvent={onSelectEvent}
            />
          </li>
        ))}
        {hiddenCount > 0 && (
          <li>
            <Link
              href={weekHref}
              className="px-1.5 font-medium text-sm text-primary hover:underline"
            >
              +{hiddenCount} mais
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}

export function MonthGrid({
  monthKey,
  weeks,
  appointments,
  events,
  now,
  onSelect,
  onSelectEvent,
  className,
}: MonthGridProps) {
  const todayKey = toDateKey(now);
  const nowDate = new Date(now);
  const headerDateKeys = weeks[0] ?? [];

  return (
    <div
      style={{ "--day-count": headerDateKeys.length } as CSSProperties}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border",
        className,
      )}
    >
      <div className="grid shrink-0 grid-cols-[repeat(var(--day-count),minmax(0,1fr))] border-b bg-muted/40">
        {headerDateKeys.map((dateKey) => (
          <span
            key={dateKey}
            className="px-2 py-2 text-muted-foreground text-sm uppercase tracking-wide"
          >
            {format(zonedDateTime(dateKey, "12:00"), "EEE", { locale: ptBR })}
          </span>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-[repeat(var(--day-count),minmax(0,1fr))] gap-px overflow-y-auto bg-border">
        {weeks.flat().map((dateKey) => (
          <MonthDay
            key={dateKey}
            dateKey={dateKey}
            isOutsideMonth={toMonthKey(dateKey) !== monthKey}
            isToday={dateKey === todayKey}
            weekHref={buildScheduleHref(
              "week",
              getWeekOffsetOfDateKey(dateKey, nowDate),
            )}
            items={listDayItems(dateKey, appointments, events)}
            onSelect={onSelect}
            onSelectEvent={onSelectEvent}
          />
        ))}
      </div>
    </div>
  );
}
