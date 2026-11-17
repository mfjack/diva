"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  INVALID_FORM_MESSAGE,
  UNAUTHORIZED_MESSAGE,
} from "@/features/auth/errors";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import {
  type ActionFailure,
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { zonedDateTime } from "@/lib/dates";
import { toCents } from "@/lib/money";
import { ROUTES } from "@/lib/routes";
import { emptyToNull } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import { PRACTICE_SETTINGS_ACTION_MESSAGES } from "./messages";
import {
  ANY_MODALITY,
  type AvailabilityBlockInput,
  availabilityBlockSchema,
  type PracticeSettingsInput,
  practiceSettingsSchema,
  type WeeklyAvailabilityInput,
  weeklyAvailabilitySchema,
} from "./schemas";
import type { AvailabilityBlockId } from "./types";

const blockIdSchema = z.uuid();

function revalidateDashboard() {
  revalidatePath(ROUTES.psychologist.dashboard, "layout");
}

function saveFailure(): ActionFailure {
  return actionFailure(PRACTICE_SETTINGS_ACTION_MESSAGES.saveFailed);
}

export async function savePracticeSettings(
  input: PracticeSettingsInput,
): Promise<ActionResult> {
  const psychologist = await getAuthorizedPsychologist();
  if (!psychologist) return actionFailure(UNAUTHORIZED_MESSAGE);
  const parsedInput = practiceSettingsSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const settings = parsedInput.data;
  const supabase = await createClient();
  const [profileResult, settingsResult] = await Promise.all([
    supabase
      .from("profiles")
      .update({ full_name: settings.psychologistName })
      .eq("id", psychologist.id),
    supabase.from("psychologist_settings").upsert({
      psychologist_id: psychologist.id,
      professional_registration: settings.professionalRegistration,
      session_duration_minutes: settings.sessionDurationMinutes,
      default_session_price_cents: toCents(settings.defaultSessionPrice),
      cancellation_notice_hours: settings.cancellationNoticeHours,
      booking_window_days: settings.bookingWindowDays,
      minimum_booking_notice_hours: settings.minimumBookingNoticeHours,
      pix_key: emptyToNull(settings.pixKey),
      office_address: emptyToNull(settings.officeAddress),
      bio: emptyToNull(settings.bio),
    }),
  ]);
  if (profileResult.error || settingsResult.error) return saveFailure();

  revalidateDashboard();
  return actionSuccess();
}

export async function saveWeeklyAvailability(
  input: WeeklyAvailabilityInput,
): Promise<ActionResult> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const parsedInput = weeklyAvailabilitySchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const supabase = await createClient();
  const { error } = await supabase.rpc("replace_availability_rules", {
    p_rules: parsedInput.data.intervals.map((interval) => ({
      weekday: interval.weekday,
      start_time: interval.startTime,
      end_time: interval.endTime,
      modality: interval.modality === ANY_MODALITY ? "" : interval.modality,
    })),
  });
  if (error) return saveFailure();

  revalidateDashboard();
  return actionSuccess();
}

export async function createAvailabilityBlock(
  input: AvailabilityBlockInput,
): Promise<ActionResult<{ id: AvailabilityBlockId }>> {
  const psychologist = await getAuthorizedPsychologist();
  if (!psychologist) return actionFailure(UNAUTHORIZED_MESSAGE);
  const parsedInput = availabilityBlockSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const { startDate, startTime, endDate, endTime, reason } = parsedInput.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_blocks")
    .insert({
      psychologist_id: psychologist.id,
      starts_at: zonedDateTime(startDate, startTime).toISOString(),
      ends_at: zonedDateTime(endDate, endTime).toISOString(),
      reason: emptyToNull(reason),
    })
    .select("id")
    .single();
  if (error) return saveFailure();

  revalidateDashboard();
  return actionSuccess({ id: data.id as AvailabilityBlockId });
}

export async function deleteAvailabilityBlock(
  blockId: AvailabilityBlockId,
): Promise<ActionResult> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const parsedId = blockIdSchema.safeParse(blockId);
  if (!parsedId.success) return actionFailure(INVALID_FORM_MESSAGE);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_blocks")
    .delete()
    .eq("id", parsedId.data)
    .select("id");
  if (error) return saveFailure();
  if (data.length === 0) {
    return actionFailure(PRACTICE_SETTINGS_ACTION_MESSAGES.blockNotFound);
  }

  revalidateDashboard();
  return actionSuccess();
}
