import type { AppointmentModality } from "@/features/appointments/types";
import type { Brand } from "@/lib/brand";
import type { Cents } from "@/lib/money";

export type AvailabilityRuleId = Brand<string, "AvailabilityRuleId">;

export type AvailabilityBlockId = Brand<string, "AvailabilityBlockId">;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PracticeSettings = {
  psychologistName: string;
  professionalRegistration: string | null;
  bio: string | null;
  sessionDurationMinutes: number;
  defaultSessionPriceCents: Cents;
  cancellationNoticeHours: number;
  bookingWindowDays: number;
  minimumBookingNoticeHours: number;
  pixKey: string | null;
  meetingUrl: string | null;
  officeAddress: string | null;
};

export type AvailabilityRule = {
  id: AvailabilityRuleId;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  modality: AppointmentModality | null;
};

export type AvailabilityBlock = {
  id: AvailabilityBlockId;
  startsAt: string;
  endsAt: string;
  reason: string | null;
};
