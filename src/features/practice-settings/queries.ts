import "server-only";

import { cache } from "react";
import { getCurrentUser } from "@/features/auth/queries";
import type { Cents } from "@/lib/money";
import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import type {
  AvailabilityBlock,
  AvailabilityBlockId,
  AvailabilityRule,
  AvailabilityRuleId,
  PracticeSettings,
  Weekday,
} from "./types";

const DEFAULT_PRACTICE_SETTINGS: Omit<PracticeSettings, "psychologistName"> = {
  professionalRegistration: null,
  bio: null,
  sessionDurationMinutes: 50,
  defaultSessionPriceCents: 0 as Cents,
  cancellationNoticeHours: 24,
  bookingWindowDays: 30,
  minimumBookingNoticeHours: 2,
  pixKey: null,
  meetingUrl: null,
  officeAddress: null,
};

const TIME_LENGTH = 5;

function toTime(databaseTime: string): string {
  return databaseTime.slice(0, TIME_LENGTH);
}

function toPracticeSettings(
  psychologistName: string,
  row: Tables<"psychologist_settings"> | null,
): PracticeSettings {
  if (!row) return { ...DEFAULT_PRACTICE_SETTINGS, psychologistName };
  return {
    psychologistName,
    professionalRegistration: row.professional_registration,
    bio: row.bio,
    sessionDurationMinutes: row.session_duration_minutes,
    defaultSessionPriceCents: row.default_session_price_cents as Cents,
    cancellationNoticeHours: row.cancellation_notice_hours,
    bookingWindowDays: row.booking_window_days,
    minimumBookingNoticeHours: row.minimum_booking_notice_hours,
    pixKey: row.pix_key,
    meetingUrl: row.meeting_url,
    officeAddress: row.office_address,
  };
}

export const getPracticeSettings = cache(
  async (): Promise<PracticeSettings> => {
    const user = await getCurrentUser();
    if (!user) return { ...DEFAULT_PRACTICE_SETTINGS, psychologistName: "" };

    const supabase = await createClient();
    const { data } = await supabase
      .from("psychologist_settings")
      .select("*")
      .eq("psychologist_id", user.id)
      .maybeSingle();
    return toPracticeSettings(user.fullName, data);
  },
);

export const listAvailabilityRules = cache(
  async (): Promise<AvailabilityRule[]> => {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = await createClient();
    const { data } = await supabase
      .from("availability_rules")
      .select("id, weekday, start_time, end_time, modality")
      .eq("psychologist_id", user.id)
      .order("weekday")
      .order("start_time");
    return (data ?? []).map((rule) => ({
      id: rule.id as AvailabilityRuleId,
      weekday: rule.weekday as Weekday,
      startTime: toTime(rule.start_time),
      endTime: toTime(rule.end_time),
      modality: rule.modality,
    }));
  },
);

export const listAvailabilityBlocks = cache(
  async (): Promise<AvailabilityBlock[]> => {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = await createClient();
    const { data } = await supabase
      .from("availability_blocks")
      .select("id, starts_at, ends_at, reason")
      .eq("psychologist_id", user.id)
      .order("starts_at");
    return (data ?? []).map((block) => ({
      id: block.id as AvailabilityBlockId,
      startsAt: block.starts_at,
      endsAt: block.ends_at,
      reason: block.reason,
    }));
  },
);
