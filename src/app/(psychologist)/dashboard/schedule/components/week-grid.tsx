import type { Appointment, AppointmentId } from "@/features/appointments/types";
import { isSameDateKey, toDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import {
  getBlockPosition,
  getHoursOfRange,
  getNowLineTopRem,
  HOUR_HEIGHT_REM,
  type HourRange,
} from "../schedule-layout";
import { AppointmentBlock } from "./appointment-block";
import { DayHeading, getDayLabel } from "./day-heading";

type WeekGridProps = {
  dateKeys: readonly string[];
  appointments: readonly Appointment[];
  hourRange: HourRange;
  now: string;
  onSelect: (appointmentId: AppointmentId) => void;
  className?: string;
};

function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, "0")}h`;
}

export function WeekGrid({
  dateKeys,
  appointments,
  hourRange,
  now,
  onSelect,
  className,
}: WeekGridProps) {
  const hours = getHoursOfRange(hourRange);
  const todayKey = toDateKey(now);
  const columnsStyle = {
    gridTemplateColumns: `3.5rem repeat(${dateKeys.length}, minmax(0, 1fr))`,
  };
  const bodyStyle = { height: `${hours.length * HOUR_HEIGHT_REM}rem` };

  return (
    <div
      className={cn(
        "flex-col overflow-hidden rounded-xl border bg-card",
        className,
      )}
    >
      <div className="grid shrink-0 border-b" style={columnsStyle}>
        <span aria-hidden />
        {dateKeys.map((dateKey) => (
          <div key={dateKey} className="border-l px-3 py-3">
            <DayHeading dateKey={dateKey} isToday={dateKey === todayKey} />
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 overflow-y-auto" style={columnsStyle}>
        <div className="relative" style={bodyStyle} aria-hidden>
          {hours.map((hour, index) => (
            <span
              key={hour}
              className="absolute right-2 pt-1 text-muted-foreground text-xs tabular-nums"
              style={{ top: `${index * HOUR_HEIGHT_REM}rem` }}
            >
              {formatHour(hour)}
            </span>
          ))}
        </div>

        {dateKeys.map((dateKey) => {
          const nowLineTopRem = getNowLineTopRem(now, dateKey, hourRange);

          return (
            <section
              key={dateKey}
              aria-label={getDayLabel(dateKey)}
              className={cn(
                "relative border-l",
                dateKey === todayKey && "bg-primary/3",
              )}
              style={bodyStyle}
            >
              {hours.map((hour, index) => (
                <span
                  key={hour}
                  aria-hidden
                  className="absolute inset-x-0 border-t first:border-t-0"
                  style={{ top: `${index * HOUR_HEIGHT_REM}rem` }}
                />
              ))}

              {appointments
                .filter(({ startsAt }) => isSameDateKey(startsAt, dateKey))
                .map((appointment) => {
                  const { topRem, heightRem } = getBlockPosition(
                    appointment.startsAt,
                    appointment.endsAt,
                    hourRange.firstHour,
                  );
                  return (
                    <AppointmentBlock
                      key={appointment.id}
                      appointment={appointment}
                      onSelect={onSelect}
                      className="absolute inset-x-1 z-0"
                      style={{ top: `${topRem}rem`, height: `${heightRem}rem` }}
                    />
                  );
                })}

              {nowLineTopRem !== null && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 z-10 h-0.5 bg-destructive before:absolute before:-top-1 before:-left-1 before:size-2.5 before:rounded-full before:bg-destructive"
                  style={{ top: `${nowLineTopRem}rem` }}
                />
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
