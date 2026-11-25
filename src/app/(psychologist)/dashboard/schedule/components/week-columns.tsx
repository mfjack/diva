import type { CSSProperties } from "react";
import type { Appointment, AppointmentId } from "@/features/appointments/types";
import type {
  CalendarEvent,
  CalendarEventId,
} from "@/features/calendar-events/types";
import { toDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { listDayItems } from "../schedule-layout";
import { AppointmentCard } from "./appointment-card";
import { CalendarEventCard } from "./calendar-event-card";
import { DayHeading, getDayLabel } from "./day-heading";

type WeekColumnsProps = {
  dateKeys: readonly string[];
  appointments: readonly Appointment[];
  events: readonly CalendarEvent[];
  now: string;
  onSelect: (appointmentId: AppointmentId) => void;
  onSelectEvent: (eventId: CalendarEventId) => void;
  className?: string;
};

export function WeekColumns({
  dateKeys,
  appointments,
  events,
  now,
  onSelect,
  onSelectEvent,
  className,
}: WeekColumnsProps) {
  const todayKey = toDateKey(now);

  return (
    <div
      style={{ "--day-count": dateKeys.length } as CSSProperties}
      className={cn(
        "grid gap-6 lg:grid-cols-[repeat(var(--day-count),minmax(0,1fr))] lg:grid-rows-[minmax(0,1fr)] lg:gap-3",
        className,
      )}
    >
      {dateKeys.map((dateKey) => {
        const isToday = dateKey === todayKey;
        const dayItems = listDayItems(dateKey, appointments, events);

        return (
          <section
            key={dateKey}
            aria-label={getDayLabel(dateKey)}
            className="flex min-w-0 flex-col gap-2 lg:min-h-0"
          >
            <header
              className={cn(
                "shrink-0 border-b pb-2",
                isToday && "border-primary",
              )}
            >
              <DayHeading dateKey={dateKey} isToday={isToday} />
            </header>
            {dayItems.length > 0 ? (
              <div className="flex flex-col gap-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                {dayItems.map((item) =>
                  item.kind === "session" ? (
                    <AppointmentCard
                      key={item.appointment.id}
                      appointment={item.appointment}
                      onSelect={onSelect}
                    />
                  ) : (
                    <CalendarEventCard
                      key={item.event.id}
                      event={item.event}
                      onSelect={onSelectEvent}
                    />
                  ),
                )}
              </div>
            ) : (
              <p className="py-2 text-muted-foreground text-sm">Dia livre</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
