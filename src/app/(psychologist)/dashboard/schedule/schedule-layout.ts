import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment } from "@/features/appointments/types";
import type { AvailabilityRule } from "@/features/practice-settings/types";
import { getWeekdayOfDateKey, isSameDateKey, zonedDateTime } from "@/lib/dates";

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
