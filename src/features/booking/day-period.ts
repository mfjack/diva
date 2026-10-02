import { toAppTimeZone } from "@/lib/format";
import type { AvailableSlot } from "./available-slots";

export const DAY_PERIODS = [
  { id: "morning", label: "Manhã", untilHour: 12 },
  { id: "afternoon", label: "Tarde", untilHour: 18 },
  { id: "evening", label: "Noite", untilHour: 24 },
] as const;

export type DayPeriodId = (typeof DAY_PERIODS)[number]["id"];

export function groupSlotsByDayPeriod(slots: readonly AvailableSlot[]) {
  return DAY_PERIODS.map((period, index) => {
    const fromHour = DAY_PERIODS[index - 1]?.untilHour ?? 0;
    return {
      ...period,
      slots: slots.filter((slot) => {
        const hour = toAppTimeZone(slot.startsAt).getHours();
        return hour >= fromHour && hour < period.untilHour;
      }),
    };
  }).filter(({ slots: periodSlots }) => periodSlots.length > 0);
}
