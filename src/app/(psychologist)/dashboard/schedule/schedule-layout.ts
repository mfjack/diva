import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment } from "@/features/appointments/types";
import type { CalendarEvent } from "@/features/calendar-events/types";
import type { AvailabilityRule } from "@/features/practice-settings/types";
import { getWeekdayOfDateKey, isSameDateKey, zonedDateTime } from "@/lib/dates";
import { ROUTES } from "@/lib/routes";

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

export const SCHEDULE_VIEWS = ["week", "month"] as const;

export type ScheduleView = (typeof SCHEDULE_VIEWS)[number];

export type ScheduleCalendar =
  | { view: "week"; dateKeys: string[] }
  | { view: "month"; monthKey: string; weeks: string[][] };

export function listCalendarDateKeys(calendar: ScheduleCalendar): string[] {
  return calendar.view === "week" ? calendar.dateKeys : calendar.weeks.flat();
}

export function parseScheduleView(
  value: string | string[] | undefined,
): ScheduleView {
  const view = Array.isArray(value) ? value[0] : value;
  return view === "month" ? "month" : "week";
}

const OFFSET_PARAM_BY_VIEW = {
  week: "week",
  month: "month",
} as const satisfies Record<ScheduleView, string>;

export function buildScheduleHref(view: ScheduleView, offset: number): string {
  const searchParams = new URLSearchParams();
  if (view === "month") searchParams.set("view", view);
  if (offset !== 0)
    searchParams.set(OFFSET_PARAM_BY_VIEW[view], String(offset));
  const query = searchParams.toString();
  return query
    ? `${ROUTES.psychologist.schedule}?${query}`
    : ROUTES.psychologist.schedule;
}

const RELATIVE_PERIOD_LABELS = {
  week: {
    current: "Esta semana",
    next: "Próxima semana",
    previous: "Semana passada",
    unit: "semanas",
  },
  month: {
    current: "Este mês",
    next: "Próximo mês",
    previous: "Mês passado",
    unit: "meses",
  },
} as const satisfies Record<
  ScheduleView,
  { current: string; next: string; previous: string; unit: string }
>;

export function getPeriodLabel(view: ScheduleView, offset: number): string {
  const labels = RELATIVE_PERIOD_LABELS[view];
  if (offset === 0) return labels.current;
  if (offset === 1) return labels.next;
  if (offset === -1) return labels.previous;
  return offset > 0
    ? `Daqui a ${offset} ${labels.unit}`
    : `Há ${Math.abs(offset)} ${labels.unit}`;
}

export function getVisibleMonthWeeks(
  weeks: readonly (readonly string[])[],
  rules: readonly Pick<AvailabilityRule, "weekday">[],
  appointments: readonly Pick<Appointment, "startsAt">[],
): string[][] {
  const visibleWeekdays = new Set(
    getVisibleDateKeys(weeks.flat(), rules, appointments).map(
      getWeekdayOfDateKey,
    ),
  );
  return weeks.map((week) =>
    week.filter((dateKey) => visibleWeekdays.has(getWeekdayOfDateKey(dateKey))),
  );
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

export type ScheduleItem =
  | { kind: "session"; startsAt: string; appointment: Appointment }
  | { kind: "event"; startsAt: string; event: CalendarEvent };

function isCancelledItem(item: ScheduleItem): boolean {
  return item.kind === "session" && item.appointment.status === "cancelled";
}

function compareScheduleItems(
  first: ScheduleItem,
  second: ScheduleItem,
): number {
  return (
    first.startsAt.localeCompare(second.startsAt) ||
    Number(isCancelledItem(first)) - Number(isCancelledItem(second))
  );
}

export function listDayItems(
  dateKey: string,
  appointments: readonly Appointment[],
  events: readonly CalendarEvent[],
): ScheduleItem[] {
  const sessionItems: ScheduleItem[] = appointments
    .filter(({ startsAt }) => isSameDateKey(startsAt, dateKey))
    .map((appointment) => ({
      kind: "session",
      startsAt: appointment.startsAt,
      appointment,
    }));
  const eventItems: ScheduleItem[] = events
    .filter(({ startsAt }) => isSameDateKey(startsAt, dateKey))
    .map((event) => ({ kind: "event", startsAt: event.startsAt, event }));
  return [...sessionItems, ...eventItems].sort(compareScheduleItems);
}
