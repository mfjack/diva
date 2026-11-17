import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment } from "@/features/appointments/types";
import type { AvailabilityRule } from "@/features/practice-settings/types";
import {
  getWeekdayOfDateKey,
  isSameDateKey,
  minutesBetween,
  parseTime,
  toDateKey,
  zonedDateTime,
} from "@/lib/dates";
import { toAppTimeZone } from "@/lib/format";
import { MINUTES_PER_HOUR } from "@/lib/time-slots";

const DEFAULT_FIRST_HOUR = 8;
const DEFAULT_LAST_HOUR = 18;
const BLOCK_SNAP_MINUTES = 30;
const BLOCK_INSET_REM = 0.25;

export const HOUR_HEIGHT_REM = 4;

export type HourRange = {
  firstHour: number;
  lastHour: number;
};

type BlockPosition = {
  topRem: number;
  heightRem: number;
};

export function getVisibleDateKeys(
  weekDateKeys: readonly string[],
  rules: readonly Pick<AvailabilityRule, "weekday">[],
  appointments: readonly Pick<Appointment, "startsAt">[],
): string[] {
  const workingWeekdays = new Set<number>(rules.map(({ weekday }) => weekday));

  return weekDateKeys.filter(
    (dateKey) =>
      workingWeekdays.has(getWeekdayOfDateKey(dateKey)) ||
      appointments.some(({ startsAt }) => isSameDateKey(startsAt, dateKey)),
  );
}

function getHourOfDay(date: string): number {
  const zonedDate = toAppTimeZone(date);
  return zonedDate.getHours() + zonedDate.getMinutes() / MINUTES_PER_HOUR;
}

export function getHourRange(
  rules: readonly Pick<AvailabilityRule, "startTime" | "endTime">[],
  appointments: readonly Pick<Appointment, "startsAt" | "endsAt">[],
): HourRange {
  const startHours = [
    ...rules.map(({ startTime }) => parseTime(startTime).hours),
    ...appointments.map(({ startsAt }) => Math.floor(getHourOfDay(startsAt))),
  ];
  const endHours = [
    ...rules.map(({ endTime }) => {
      const { hours, minutes } = parseTime(endTime);
      return minutes > 0 ? hours + 1 : hours;
    }),
    ...appointments.map(({ endsAt }) => Math.ceil(getHourOfDay(endsAt))),
  ];

  if (startHours.length === 0) {
    return { firstHour: DEFAULT_FIRST_HOUR, lastHour: DEFAULT_LAST_HOUR };
  }
  return {
    firstHour: Math.min(...startHours),
    lastHour: Math.max(...endHours),
  };
}

export function getHoursOfRange({ firstHour, lastHour }: HourRange): number[] {
  return Array.from(
    { length: lastHour - firstHour },
    (_, index) => firstHour + index,
  );
}

export function getBlockPosition(
  startsAt: string,
  endsAt: string,
  firstHour: number,
): BlockPosition {
  const startHour = getHourOfDay(startsAt);
  const snappedMinutes =
    Math.ceil(minutesBetween(startsAt, endsAt) / BLOCK_SNAP_MINUTES) *
    BLOCK_SNAP_MINUTES;
  return {
    topRem: (startHour - firstHour) * HOUR_HEIGHT_REM + BLOCK_INSET_REM,
    heightRem:
      (snappedMinutes / MINUTES_PER_HOUR) * HOUR_HEIGHT_REM -
      2 * BLOCK_INSET_REM,
  };
}

export function getNowLineTopRem(
  now: string,
  dateKey: string,
  { firstHour, lastHour }: HourRange,
): number | null {
  if (toDateKey(now) !== dateKey) return null;
  const hour = getHourOfDay(now);
  if (hour < firstHour || hour > lastHour) return null;
  return (hour - firstHour) * HOUR_HEIGHT_REM;
}

export function getWeekLabel(weekOffset: number): string {
  if (weekOffset === 0) return "Esta semana";
  if (weekOffset === 1) return "Próxima semana";
  if (weekOffset === -1) return "Semana passada";
  return weekOffset > 0
    ? `Daqui a ${weekOffset} semanas`
    : `Há ${Math.abs(weekOffset)} semanas`;
}

export function listPendingRequests(
  appointments: readonly Appointment[],
  now: string,
): Appointment[] {
  return appointments
    .filter(({ status, startsAt }) => status === "scheduled" && startsAt > now)
    .sort((first, second) => first.startsAt.localeCompare(second.startsAt));
}

export function formatWeekRange(
  firstDateKey: string,
  lastDateKey: string,
): string {
  const firstDay = zonedDateTime(firstDateKey, "12:00");
  const lastDay = zonedDateTime(lastDateKey, "12:00");
  const isSameMonth = format(firstDay, "M") === format(lastDay, "M");
  const firstLabel = isSameMonth
    ? format(firstDay, "d")
    : format(firstDay, "d 'de' MMM", { locale: ptBR });
  return `${firstLabel} a ${format(lastDay, "d 'de' MMM", { locale: ptBR })}`;
}

export function mergeAppointments(
  ...appointmentLists: readonly (readonly Appointment[])[]
): Appointment[] {
  const appointmentsById = new Map(
    appointmentLists.flat().map((appointment) => [appointment.id, appointment]),
  );
  return [...appointmentsById.values()];
}
