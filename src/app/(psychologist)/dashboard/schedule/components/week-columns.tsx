import type { CSSProperties } from "react";
import type { Appointment, AppointmentId } from "@/features/appointments/types";
import { isSameDateKey, toDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { AppointmentCard } from "./appointment-card";
import { DayHeading, getDayLabel } from "./day-heading";

type WeekColumnsProps = {
  dateKeys: readonly string[];
  appointments: readonly Appointment[];
  now: string;
  onSelect: (appointmentId: AppointmentId) => void;
  className?: string;
};

export function WeekColumns({
  dateKeys,
  appointments,
  now,
  onSelect,
  className,
}: WeekColumnsProps) {
  const todayKey = toDateKey(now);

  return (
    <div
      style={{ "--day-count": dateKeys.length } as CSSProperties}
      className={cn(
        "grid gap-6 lg:grid-cols-[repeat(var(--day-count),minmax(0,1fr))] lg:gap-3",
        className,
      )}
    >
      {dateKeys.map((dateKey) => {
        const isToday = dateKey === todayKey;
        const dayAppointments = appointments
          .filter(({ startsAt }) => isSameDateKey(startsAt, dateKey))
          .sort((first, second) =>
            first.startsAt.localeCompare(second.startsAt),
          );

        return (
          <section
            key={dateKey}
            aria-label={getDayLabel(dateKey)}
            className="flex min-w-0 flex-col gap-2"
          >
            <header
              className={cn("border-b pb-2", isToday && "border-primary")}
            >
              <DayHeading dateKey={dateKey} isToday={isToday} />
            </header>
            {dayAppointments.length > 0 ? (
              dayAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onSelect={onSelect}
                />
              ))
            ) : (
              <p className="py-2 text-muted-foreground text-xs">Sem sessões</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
