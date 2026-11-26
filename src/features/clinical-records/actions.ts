"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  deleteAttachment,
  storeAttachment,
} from "@/features/attachments/storage";
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
import {
  ATTACHMENT_UPLOAD_MESSAGES,
  readAttachmentUpload,
} from "@/lib/attachment-upload";
import { ROUTES } from "@/lib/routes";
import { emptyToNull } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import {
  encryptClinicalContent,
  encryptClinicalFile,
} from "./content-encryption";
import { CLINICAL_RECORD_ACTION_MESSAGES } from "./messages";
import {
  countClinicalRecordAttachments,
  hasClinicalRecord,
  isPatientSession,
  listPatientSessionOptions,
} from "./queries";
import {
  type ClinicalRecordInput,
  clinicalRecordSchema,
  patientSessionsSchema,
} from "./schemas";
import type {
  ClinicalRecordAttachmentId,
  ClinicalRecordId,
  SessionOption,
} from "./types";

const SESSION_NOTE_KIND = "session_note";

const recordIdSchema = z.uuid();

function revalidateRecords(): void {
  revalidatePath(ROUTES.psychologist.dashboard, "layout");
}

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
  const appointmentId = emptyToNull(parsedInput.data.appointmentId);
  if (appointmentId && !(await isPatientSession(patient.id, appointmentId))) {
    return actionFailure(CLINICAL_RECORD_ACTION_MESSAGES.sessionNotFound);
  }

  const fields = {
    patient_id: patient.id,
    appointment_id: appointmentId,
    kind: SESSION_NOTE_KIND,
    title: parsedInput.data.title,
    encrypted_content: encryptClinicalContent(parsedInput.data.content),
  } as const;
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
  revalidateRecords();
  return actionSuccess({ id: savedRecordId });
}

export async function listSessionOptions(
  patientId: string,
): Promise<ActionResult<SessionOption[]>> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const parsedId = patientSessionsSchema.safeParse(patientId);
  if (!parsedId.success) return actionFailure(INVALID_FORM_MESSAGE);
  return actionSuccess(await listPatientSessionOptions(parsedId.data));
}

export async function uploadClinicalRecordAttachment(
  recordId: ClinicalRecordId,
  formData: FormData,
): Promise<ActionResult> {
  const psychologist = await getAuthorizedPsychologist();
  if (!psychologist) return actionFailure(UNAUTHORIZED_MESSAGE);
  const attachmentCount = await countClinicalRecordAttachments(recordId);
  if (attachmentCount === null) {
    return actionFailure(CLINICAL_RECORD_ACTION_MESSAGES.recordNotFound);
  }
  const upload = await readAttachmentUpload(formData, attachmentCount);
  if (!upload.isValid) return actionFailure(upload.message);

  const attachmentId = await storeAttachment({
    store: "clinicalRecord",
    psychologistId: psychologist.id,
    itemId: recordId,
    upload,
    encrypt: encryptClinicalFile,
    insertRow: (supabase, fields) =>
      supabase
        .from("clinical_record_attachments")
        .insert({ ...fields, record_id: recordId }),
  });
  if (!attachmentId) {
    return actionFailure(ATTACHMENT_UPLOAD_MESSAGES.uploadFailed);
  }

  await recordAuditLog({
    actorUserId: psychologist.id,
    action: "clinical_record_attachment.uploaded",
    entityType: "clinical_record_attachment",
    entityId: attachmentId,
  });
  revalidateRecords();
  return actionSuccess();
}

export async function deleteClinicalRecordAttachment(
  recordId: ClinicalRecordId,
  attachmentId: ClinicalRecordAttachmentId,
): Promise<ActionResult> {
  const psychologist = await getAuthorizedPsychologist();
  if (!psychologist) return actionFailure(UNAUTHORIZED_MESSAGE);
  const parsedRecordId = recordIdSchema.safeParse(recordId);
  if (!parsedRecordId.success) return actionFailure(INVALID_FORM_MESSAGE);

  const result = await deleteAttachment({
    store: "clinicalRecord",
    attachmentId,
    failureMessage: CLINICAL_RECORD_ACTION_MESSAGES.saveFailed,
    deleteRow: (supabase, parsedAttachmentId) =>
      supabase
        .from("clinical_record_attachments")
        .delete()
        .eq("id", parsedAttachmentId)
        .eq("record_id", parsedRecordId.data)
        .select("storage_path"),
  });
  if (result.status === "error") return result;

  await recordAuditLog({
    actorUserId: psychologist.id,
    action: "clinical_record_attachment.deleted",
    entityType: "clinical_record_attachment",
    entityId: attachmentId,
  });
  revalidateRecords();
  return actionSuccess();
}
