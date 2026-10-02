import type {
  AvailabilityBlock,
  AvailabilityBlockId,
  AvailabilityRule,
  AvailabilityRuleId,
  PracticeSettings,
} from "@/features/practice-settings/types";
import type { Cents } from "@/lib/money";
import { mockDateTime } from "./mock-dates";

export const mockPracticeSettings: PracticeSettings = {
  psychologistName: "Helena Duarte",
  professionalRegistration: "CRP 06/154872",
  bio: "Psicóloga clínica com abordagem em Terapia Cognitivo-Comportamental. Atendo adolescentes e adultos, presencialmente e online.",
  sessionDurationMinutes: 50,
  defaultSessionPriceCents: 22000 as Cents,
  cancellationNoticeHours: 24,
  bookingWindowDays: 30,
  minimumBookingNoticeHours: 2,
  pixKey: "helena.duarte@psicologia.com.br",
  officeAddress: "Rua Harmonia, 412, sala 54 · Vila Madalena, São Paulo",
};

function rule(
  id: string,
  weekday: AvailabilityRule["weekday"],
  startTime: string,
  endTime: string,
  modality: AvailabilityRule["modality"],
): AvailabilityRule {
  return {
    id: id as AvailabilityRuleId,
    weekday,
    startTime,
    endTime,
    modality,
  };
}

export const mockAvailabilityRules: AvailabilityRule[] = [
  rule("rule-mon-1", 1, "08:00", "12:00", "in_person"),
  rule("rule-mon-2", 1, "14:00", "19:00", "in_person"),
  rule("rule-tue-1", 2, "13:00", "20:00", "online"),
  rule("rule-wed-1", 3, "08:00", "12:00", "in_person"),
  rule("rule-wed-2", 3, "14:00", "19:00", null),
  rule("rule-thu-1", 4, "13:00", "20:00", "online"),
  rule("rule-fri-1", 5, "08:00", "13:00", null),
];

export const mockAvailabilityBlocks: AvailabilityBlock[] = [
  {
    id: "block-1" as AvailabilityBlockId,
    startsAt: mockDateTime(9, "00:00"),
    endsAt: mockDateTime(10, "23:59"),
    reason: "Congresso de Psicologia",
  },
  {
    id: "block-2" as AvailabilityBlockId,
    startsAt: mockDateTime(18, "14:00"),
    endsAt: mockDateTime(18, "19:00"),
    reason: "Supervisão clínica",
  },
];
