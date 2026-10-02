"use server";

import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { type ClinicalRecordInput, clinicalRecordSchema } from "./schemas";
import type { ClinicalRecordId } from "./types";

export async function saveClinicalRecord(
  _recordId: ClinicalRecordId | null,
  input: ClinicalRecordInput,
): Promise<ActionResult> {
  const parsedInput = clinicalRecordSchema.safeParse(input);
  if (!parsedInput.success) {
    return actionFailure("Confira os campos destacados.");
  }

  return actionSuccess();
}
