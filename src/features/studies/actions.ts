"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { findAuthorizedEntity } from "@/features/auth/authorized-entity";
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
import {
  ATTACHMENT_UPLOAD_MESSAGES,
  readAttachmentUpload,
} from "@/lib/attachment-upload";
import { getRichTextPlainText } from "@/lib/rich-text";
import { ROUTES } from "@/lib/routes";
import type { Json, TablesUpdate } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { STUDY_NOTE_ACTION_MESSAGES } from "./messages";
import { normalizeTags } from "./note-list";
import { getStudyNote } from "./queries";
import { type StudyNoteInput, studyNoteSchema } from "./schemas";
import {
  getStudyNoteAttachmentPath,
  STUDY_NOTE_ATTACHMENTS_BUCKET,
} from "./storage";
import type { StudyNoteAttachmentId, StudyNoteId } from "./types";

const attachmentIdSchema = z.uuid();

function findAuthorizedNote(noteId: string) {
  return findAuthorizedEntity(
    noteId,
    getStudyNote,
    STUDY_NOTE_ACTION_MESSAGES.notFound,
  );
}

function revalidateStudies(): void {
  revalidatePath(ROUTES.psychologist.studies);
}

async function updateStudyNote(
  noteId: StudyNoteId,
  changes: TablesUpdate<"study_notes">,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("study_notes")
    .update(changes)
    .eq("id", noteId);
  return error === null;
}

export async function createStudyNote(): Promise<
  ActionResult<{ noteId: StudyNoteId }>
> {
  const psychologist = await getAuthorizedPsychologist();
  if (!psychologist) return actionFailure(UNAUTHORIZED_MESSAGE);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_notes")
    .insert({ psychologist_id: psychologist.id })
    .select("id")
    .single();
  if (error) return actionFailure(STUDY_NOTE_ACTION_MESSAGES.saveFailed);
  const noteId = data.id as StudyNoteId;
  revalidateStudies();
  return actionSuccess({ noteId });
}

export async function saveStudyNote(
  noteId: StudyNoteId,
  input: StudyNoteInput,
): Promise<ActionResult<{ savedAt: string }>> {
  const lookup = await findAuthorizedNote(noteId);
  if (!lookup.isFound) return lookup.failure;
  const parsedInput = studyNoteSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const { title, kind, content, tags, sourceTitle, sourceAuthor, sourceUrl } =
    parsedInput.data;
  const hasSource = Boolean(sourceTitle || sourceAuthor || sourceUrl);
  const savedAt = new Date().toISOString();
  const isSaved = await updateStudyNote(lookup.entity.id, {
    title,
    kind,
    content: content as Json,
    plain_text: getRichTextPlainText(content),
    tags: normalizeTags(tags),
    source_title: hasSource ? sourceTitle || null : null,
    source_author: hasSource ? sourceAuthor || null : null,
    source_url: hasSource ? sourceUrl || null : null,
    updated_at: savedAt,
  });
  if (!isSaved) return actionFailure(STUDY_NOTE_ACTION_MESSAGES.saveFailed);
  revalidateStudies();
  return actionSuccess({ savedAt });
}

export async function toggleStudyNotePin(
  noteId: StudyNoteId,
): Promise<ActionResult> {
  const lookup = await findAuthorizedNote(noteId);
  if (!lookup.isFound) return lookup.failure;

  const isSaved = await updateStudyNote(lookup.entity.id, {
    is_pinned: !lookup.entity.isPinned,
  });
  if (!isSaved) return actionFailure(STUDY_NOTE_ACTION_MESSAGES.saveFailed);
  revalidateStudies();
  return actionSuccess();
}

export async function deleteStudyNote(
  noteId: StudyNoteId,
): Promise<ActionResult> {
  const lookup = await findAuthorizedNote(noteId);
  if (!lookup.isFound) return lookup.failure;

  const isSaved = await updateStudyNote(lookup.entity.id, {
    deleted_at: new Date().toISOString(),
  });
  if (!isSaved) return actionFailure(STUDY_NOTE_ACTION_MESSAGES.saveFailed);
  revalidateStudies();
  return actionSuccess();
}

export async function uploadStudyNoteAttachment(
  noteId: StudyNoteId,
  formData: FormData,
): Promise<ActionResult> {
  const lookup = await findAuthorizedNote(noteId);
  if (!lookup.isFound) return lookup.failure;
  const upload = await readAttachmentUpload(
    formData,
    lookup.entity.attachments.length,
  );
  if (!upload.isValid) return actionFailure(upload.message);

  const attachmentId = crypto.randomUUID() as StudyNoteAttachmentId;
  const storagePath = getStudyNoteAttachmentPath(
    lookup.psychologist.id,
    lookup.entity.id,
    attachmentId,
  );
  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(STUDY_NOTE_ATTACHMENTS_BUCKET)
    .upload(storagePath, upload.content, {
      contentType: upload.contentType,
      upsert: false,
    });
  if (uploadError) {
    return actionFailure(ATTACHMENT_UPLOAD_MESSAGES.uploadFailed);
  }

  const { error } = await supabase.from("study_note_attachments").insert({
    id: attachmentId,
    note_id: lookup.entity.id,
    psychologist_id: lookup.psychologist.id,
    storage_path: storagePath,
    file_name: upload.fileName,
    content_type: upload.contentType,
    size_bytes: upload.sizeBytes,
  });
  if (error) {
    await supabase.storage
      .from(STUDY_NOTE_ATTACHMENTS_BUCKET)
      .remove([storagePath]);
    return actionFailure(ATTACHMENT_UPLOAD_MESSAGES.uploadFailed);
  }

  revalidateStudies();
  return actionSuccess();
}

export async function deleteStudyNoteAttachment(
  noteId: StudyNoteId,
  attachmentId: StudyNoteAttachmentId,
): Promise<ActionResult> {
  const lookup = await findAuthorizedNote(noteId);
  if (!lookup.isFound) return lookup.failure;
  const parsedAttachmentId = attachmentIdSchema.safeParse(attachmentId);
  if (!parsedAttachmentId.success) return actionFailure(INVALID_FORM_MESSAGE);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_note_attachments")
    .delete()
    .eq("id", parsedAttachmentId.data)
    .eq("note_id", lookup.entity.id)
    .select("storage_path");
  if (error) return actionFailure(STUDY_NOTE_ACTION_MESSAGES.saveFailed);
  if (data.length === 0) {
    return actionFailure(ATTACHMENT_UPLOAD_MESSAGES.notFound);
  }

  await supabase.storage
    .from(STUDY_NOTE_ATTACHMENTS_BUCKET)
    .remove(data.map(({ storage_path }) => storage_path));
  revalidateStudies();
  return actionSuccess();
}
