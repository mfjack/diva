"use server";

import { revalidatePath } from "next/cache";
import { recordAuditLog } from "@/features/audit/record-audit-log";
import {
  INVALID_FORM_MESSAGE,
  UNAUTHORIZED_MESSAGE,
} from "@/features/auth/errors";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import { getPatient } from "@/features/patients/queries";
import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import { encryptClinicalContent } from "./content-encryption";
import { CLINICAL_RECORD_ACTION_MESSAGES } from "./messages";
import { hasClinicalRecord } from "./queries";
import { type ClinicalRecordInput, clinicalRecordSchema } from "./schemas";
import type { ClinicalRecordId } from "./types";

export async function saveClinicalRecord(
  recordId: ClinicalRecordId | null,
  input: ClinicalRecordInput,
): Promise<ActionResult<{ id: ClinicalRecordId }>> {
  const psychologist = await getAuthorizedPsychologist();
  if (!psychologist) return actionFailure(UNAUTHORIZED_MESSAGE);
  const parsedInput = clinicalRecordSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const patient = await getPatient(parsedInput.data.patientId);
  if (!patient) {
    return actionFailure(CLINICAL_RECORD_ACTION_MESSAGES.patientNotFound);
  }

  const fields = {
    patient_id: patient.id,
    kind: parsedInput.data.kind,
    title: parsedInput.data.title,
    encrypted_content: encryptClinicalContent(parsedInput.data.content),
  };
  const supabase = await createClient();

  let savedRecordId: ClinicalRecordId;
  if (recordId) {
    if (!(await hasClinicalRecord(recordId))) {
      return actionFailure(CLINICAL_RECORD_ACTION_MESSAGES.recordNotFound);
    }
    const { error } = await supabase
      .from("clinical_records")
      .update(fields)
      .eq("id", recordId);
    if (error) return actionFailure(CLINICAL_RECORD_ACTION_MESSAGES.saveFailed);
    savedRecordId = recordId;
  } else {
    const { data, error } = await supabase
      .from("clinical_records")
      .insert({ ...fields, psychologist_id: psychologist.id })
      .select("id")
      .single();
    if (error) return actionFailure(CLINICAL_RECORD_ACTION_MESSAGES.saveFailed);
    savedRecordId = data.id as ClinicalRecordId;
  }

  await recordAuditLog({
    actorUserId: psychologist.id,
    action: recordId ? "clinical_record.updated" : "clinical_record.created",
    entityType: "clinical_record",
    entityId: savedRecordId,
  });
  revalidatePath(ROUTES.psychologist.dashboard, "layout");
  return actionSuccess({ id: savedRecordId });
}
