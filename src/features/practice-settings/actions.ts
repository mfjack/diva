"use server";

import { revalidatePath } from "next/cache";
import {
  INVALID_FORM_MESSAGE,
  UNAUTHORIZED_MESSAGE,
} from "@/features/auth/errors";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { zonedDateTime } from "@/lib/dates";
import { toCents } from "@/lib/money";
import { ROUTES } from "@/lib/routes";
import { emptyToNull } from "@/lib/strings";
import {
  deleteMockAvailabilityBlock,
  insertMockAvailabilityBlock,
  replaceMockAvailabilityRules,
  updateMockPracticeSettings,
} from "@/mocks/practice";
import {
  ANY_MODALITY,
  type AvailabilityBlockInput,
  availabilityBlockSchema,
  type PracticeSettingsInput,
  practiceSettingsSchema,
  type WeeklyAvailabilityInput,
  weeklyAvailabilitySchema,
} from "./schemas";
import type { AvailabilityBlockId, AvailabilityRuleId, Weekday } from "./types";

const WEEKDAYS: readonly Weekday[] = [0, 1, 2, 3, 4, 5, 6];

function toWeekday(value: number): Weekday {
  return WEEKDAYS.find((weekday) => weekday === value) ?? 0;
}

function revalidateDashboard() {
  revalidatePath(ROUTES.psychologist.dashboard, "layout");
}

export async function savePracticeSettings(
  input: PracticeSettingsInput,
): Promise<ActionResult> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const parsedInput = practiceSettingsSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const { defaultSessionPrice, pixKey, officeAddress, bio, ...settings } =
    parsedInput.data;
  updateMockPracticeSettings({
    ...settings,
    defaultSessionPriceCents: toCents(defaultSessionPrice),
    pixKey: emptyToNull(pixKey),
    officeAddress: emptyToNull(officeAddress),
    bio: emptyToNull(bio),
  });
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

  replaceMockAvailabilityRules(
    parsedInput.data.intervals.map((interval) => ({
      id: crypto.randomUUID() as AvailabilityRuleId,
      weekday: toWeekday(interval.weekday),
      startTime: interval.startTime,
      endTime: interval.endTime,
      modality: interval.modality === ANY_MODALITY ? null : interval.modality,
    })),
  );
  revalidateDashboard();
  return actionSuccess();
}

export async function createAvailabilityBlock(
  input: AvailabilityBlockInput,
): Promise<ActionResult<{ id: AvailabilityBlockId }>> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const parsedInput = availabilityBlockSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const { startDate, startTime, endDate, endTime, reason } = parsedInput.data;
  const blockId = crypto.randomUUID() as AvailabilityBlockId;
  insertMockAvailabilityBlock({
    id: blockId,
    startsAt: zonedDateTime(startDate, startTime).toISOString(),
    endsAt: zonedDateTime(endDate, endTime).toISOString(),
    reason: emptyToNull(reason),
  });
  revalidateDashboard();
  return actionSuccess({ id: blockId });
}

export async function deleteAvailabilityBlock(
  blockId: AvailabilityBlockId,
): Promise<ActionResult> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  deleteMockAvailabilityBlock(blockId);
  revalidateDashboard();
  return actionSuccess();
}
