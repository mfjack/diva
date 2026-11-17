import {
  isWithinAvailability,
  type SessionAvailability,
} from "@/features/practice-settings/availability";
import { addDaysToDateKey, zonedDateTime } from "@/lib/dates";
import { getHoliday } from "@/lib/holidays";
import { getMonthRange, toMonthKey } from "@/lib/months";

export const SESSION_REPEATS = ["none", "weekly", "biweekly"] as const;

export type SessionRepeat = (typeof SESSION_REPEATS)[number];

const REPEAT_INTERVAL_DAYS = {
  weekly: 7,
  biweekly: 14,
} as const satisfies Record<Exclude<SessionRepeat, "none">, number>;

const MINUTE_IN_MS = 60_000;

export type SessionPlanInput = {
  date: string;
  time: string;
  repeat: SessionRepeat;
};

export type SessionSkipReason =
  | "past"
  | "unavailable"
  | "conflict"
  | "holiday"
  | "blocked";

export type PlannedSession = {
  dateKey: string;
  startsAt: string;
  endsAt: string;
  skipReason: SessionSkipReason | null;
  holidayName: string | null;
};

type BusyInterval = {
  startsAt: string;
  endsAt: string;
};

export type SessionPlanContext = {
  availability: SessionAvailability;
  appointments: readonly BusyInterval[];
  blocks: readonly BusyInterval[];
  now: number;
};

function getSeriesEndDateKey(firstDateKey: string): string {
  return getMonthRange(toMonthKey(firstDateKey)).endKey;
}

export function planSessionDateKeys({
  date,
  repeat,
}: Omit<SessionPlanInput, "time">): string[] {
  if (repeat === "none") return [date];
  const repeatUntil = getSeriesEndDateKey(date);
  const dateKeys: string[] = [];
  for (
    let dateKey = date;
    dateKey <= repeatUntil;
    dateKey = addDaysToDateKey(dateKey, REPEAT_INTERVAL_DAYS[repeat])
  ) {
    dateKeys.push(dateKey);
  }
  return dateKeys;
}

function overlaps(session: BusyInterval, interval: BusyInterval): boolean {
  return (
    session.startsAt < interval.endsAt && session.endsAt > interval.startsAt
  );
}

type SessionCandidate = BusyInterval & {
  dateKey: string;
  time: string;
};

function getSkipReason(
  session: SessionCandidate,
  holidayName: string | null,
  isSeries: boolean,
  context: SessionPlanContext,
): SessionSkipReason | null {
  if (new Date(session.startsAt).getTime() <= context.now) return "past";
  if (
    !isWithinAvailability(context.availability, session.dateKey, session.time)
  ) {
    return "unavailable";
  }
  if (context.appointments.some((busy) => overlaps(session, busy))) {
    return "conflict";
  }
  if (!isSeries) return null;
  if (holidayName !== null) return "holiday";
  if (context.blocks.some((block) => overlaps(session, block))) {
    return "blocked";
  }
  return null;
}

export function planSessions(
  input: SessionPlanInput,
  context: SessionPlanContext,
): PlannedSession[] {
  const isSeries = input.repeat !== "none";
  return planSessionDateKeys(input).map((dateKey) => {
    const start = zonedDateTime(dateKey, input.time);
    const session = {
      dateKey,
      time: input.time,
      startsAt: start.toISOString(),
      endsAt: new Date(
        start.getTime() +
          context.availability.sessionDurationMinutes * MINUTE_IN_MS,
      ).toISOString(),
    };
    const holiday = getHoliday(dateKey);
    const holidayName = holiday && !holiday.isOptional ? holiday.name : null;
    return {
      dateKey,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      skipReason: getSkipReason(session, holidayName, isSeries, context),
      holidayName,
    };
  });
}

export function listBookableSessions(
  sessions: readonly PlannedSession[],
  excludedDateKeys: readonly string[] = [],
): PlannedSession[] {
  const excluded = new Set(excludedDateKeys);
  return sessions.filter(
    ({ skipReason, dateKey }) => skipReason === null && !excluded.has(dateKey),
  );
}
