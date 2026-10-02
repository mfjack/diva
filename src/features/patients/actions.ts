"use server";

import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { type PatientInput, patientSchema } from "./schemas";
import type { PatientId } from "./types";

export async function savePatient(
  _patientId: PatientId | null,
  input: PatientInput,
): Promise<ActionResult> {
  const parsedInput = patientSchema.safeParse(input);
  if (!parsedInput.success) {
    return actionFailure("Confira os campos destacados.");
  }

  return actionSuccess();
}
