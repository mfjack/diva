"use server";

import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import {
  type AvailabilityBlockInput,
  availabilityBlockSchema,
  type PracticeSettingsInput,
  practiceSettingsSchema,
  type WeeklyAvailabilityInput,
  weeklyAvailabilitySchema,
} from "./schemas";
import type { AvailabilityBlockId } from "./types";

const INVALID_FORM_MESSAGE = "Confira os campos destacados.";

export async function savePracticeSettings(
  input: PracticeSettingsInput,
): Promise<ActionResult> {
  const parsedInput = practiceSettingsSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  return actionSuccess();
}

export async function saveWeeklyAvailability(
  input: WeeklyAvailabilityInput,
): Promise<ActionResult> {
  const parsedInput = weeklyAvailabilitySchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  return actionSuccess();
}

export async function createAvailabilityBlock(
  input: AvailabilityBlockInput,
): Promise<ActionResult<{ id: AvailabilityBlockId }>> {
  const parsedInput = availabilityBlockSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  return actionSuccess({ id: crypto.randomUUID() as AvailabilityBlockId });
}

export async function deleteAvailabilityBlock(
  _blockId: AvailabilityBlockId,
): Promise<ActionResult> {
  return actionSuccess();
}
