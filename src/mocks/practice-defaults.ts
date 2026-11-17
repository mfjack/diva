import type {
  AvailabilityRule,
  AvailabilityRuleId,
  PracticeSettings,
} from "@/features/practice-settings/types";
import type { Cents } from "@/lib/money";

export const DEFAULT_PRACTICE_SETTINGS: PracticeSettings = {
  psychologistName: "Helena Duarte",
  professionalRegistration: "CRP 06/154872",
  bio: null,
  sessionDurationMinutes: 50,
  defaultSessionPriceCents: 22000 as Cents,
  cancellationNoticeHours: 24,
  bookingWindowDays: 30,
  minimumBookingNoticeHours: 2,
  pixKey: null,
  officeAddress: null,
};

function rule(
  id: string,
  weekday: AvailabilityRule["weekday"],
  startTime: string,
  endTime: string,
): AvailabilityRule {
  return {
    id: id as AvailabilityRuleId,
    weekday,
    startTime,
    endTime,
    modality: null,
  };
}

export const DEFAULT_AVAILABILITY_RULES: AvailabilityRule[] = [
  rule("rule-mon", 1, "08:00", "19:00"),
  rule("rule-tue", 2, "08:00", "19:00"),
  rule("rule-wed", 3, "08:00", "19:00"),
  rule("rule-thu", 4, "08:00", "19:00"),
  rule("rule-fri", 5, "08:00", "18:00"),
];
