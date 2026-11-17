import { parseTime } from "./dates";

export type TimeSlotOptions = {
  startHour: number;
  endHour: number;
  stepMinutes: number;
};

export type DayPeriod = "morning" | "afternoon" | "evening";

export type TimeSlotGroup = {
  period: DayPeriod;
  label: string;
  times: string[];
};

export const MINUTES_PER_HOUR = 60;

const AFTERNOON_START_HOUR = 12;
const EVENING_START_HOUR = 18;

const DAY_PERIOD_LABELS = {
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
} as const satisfies Record<DayPeriod, string>;

export const DEFAULT_TIME_SLOT_OPTIONS: TimeSlotOptions = {
  startHour: 6,
  endHour: 23,
  stepMinutes: MINUTES_PER_HOUR,
};

export function timeToMinutes(time: string): number {
  const { hours, minutes } = parseTime(time);
  return hours * MINUTES_PER_HOUR + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function roundUpToFullHour(totalMinutes: number): number {
  return Math.ceil(totalMinutes / MINUTES_PER_HOUR) * MINUTES_PER_HOUR;
}

export function buildTimeSlots({
  startHour,
  endHour,
  stepMinutes,
}: TimeSlotOptions): string[] {
  const firstMinute = startHour * MINUTES_PER_HOUR;
  const lastMinute = endHour * MINUTES_PER_HOUR;
  const slotCount = Math.floor((lastMinute - firstMinute) / stepMinutes) + 1;

  return Array.from({ length: slotCount }, (_, index) =>
    minutesToTime(firstMinute + index * stepMinutes),
  );
}

function getDayPeriod(time: string): DayPeriod {
  const hour = Number(time.slice(0, 2));
  if (hour < AFTERNOON_START_HOUR) return "morning";
  return hour < EVENING_START_HOUR ? "afternoon" : "evening";
}

export function groupTimeSlotsByPeriod(
  times: readonly string[],
): TimeSlotGroup[] {
  const groups = new Map<DayPeriod, string[]>();
  for (const time of times) {
    const period = getDayPeriod(time);
    groups.set(period, [...(groups.get(period) ?? []), time]);
  }
  return [...groups].map(([period, periodTimes]) => ({
    period,
    label: DAY_PERIOD_LABELS[period],
    times: periodTimes,
  }));
}
