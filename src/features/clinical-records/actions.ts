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
import {
  hasMockClinicalRecord,
  insertMockClinicalRecord,
  updateMockClinicalRecord,
} from "@/mocks/clinical-records";
import { CLINICAL_RECORD_ACTION_MESSAGES } from "./messages";
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

  const now = new Date().toISOString();
  const fields = {
    patientId: patient.id,
    patientName: patient.fullName,
    kind: parsedInput.data.kind,
    title: parsedInput.data.title,
    content: parsedInput.data.content,
    updatedAt: now,
  };

  const savedRecordId = recordId ?? (crypto.randomUUID() as ClinicalRecordId);
  if (recordId) {
    if (!hasMockClinicalRecord(recordId)) {
      return actionFailure(CLINICAL_RECORD_ACTION_MESSAGES.recordNotFound);
    }
    updateMockClinicalRecord(recordId, fields);
  } else {
    insertMockClinicalRecord({ id: savedRecordId, createdAt: now, ...fields });
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
