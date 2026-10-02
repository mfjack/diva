import { toAppTimeZone } from "@/lib/format";

const AFTERNOON_START_HOUR = 12;
const EVENING_START_HOUR = 18;

export function getGreeting(date: Date): string {
  const hour = toAppTimeZone(date).getHours();
  if (hour < AFTERNOON_START_HOUR) return "Bom dia";
  if (hour < EVENING_START_HOUR) return "Boa tarde";
  return "Boa noite";
}
