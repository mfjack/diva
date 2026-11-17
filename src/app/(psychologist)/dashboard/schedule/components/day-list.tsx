import type { Appointment, AppointmentId } from "@/features/appointments/types";
import { isSameDateKey, toDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { AppointmentBlock } from "./appointment-block";
import { DayHeading, getDayLabel } from "./day-heading";

type DayListProps = {
  dateKeys: readonly string[];
  appointments: readonly Appointment[];
  now: string;
  onSelect: (appointmentId: AppointmentId) => void;
  className?: string;
};

export function DayList({
  dateKeys,
  appointments,
  now,
  onSelect,
  className,
}: DayListProps) {
  const todayKey = toDateKey(now);

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {dateKeys.map((dateKey) => {
        const dayAppointments = appointments.filter(({ startsAt }) =>
          isSameDateKey(startsAt, dateKey),
        );

        return (
          <section
            key={dateKey}
            aria-label={getDayLabel(dateKey)}
            className="flex flex-col gap-2"
          >
            <DayHeading dateKey={dateKey} isToday={dateKey === todayKey} />
            {dayAppointments.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {dayAppointments.map((appointment) => (
                  <AppointmentBlock
                    key={appointment.id}
                    appointment={appointment}
                    onSelect={onSelect}
                    className="w-full px-3 py-2.5 text-sm"
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Sem sessões</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
