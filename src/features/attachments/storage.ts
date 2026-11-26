import "server-only";

import { z } from "zod";
import { INVALID_FORM_MESSAGE } from "@/features/auth/errors";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import type { UserId } from "@/features/auth/types";
import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import {
  ATTACHMENT_UPLOAD_MESSAGES,
  type AttachmentUpload,
  buildAttachmentResponse,
} from "@/lib/attachment-upload";
import {
  ATTACHMENT_COLUMNS,
  toAttachment,
} from "@/lib/supabase/attachment-rows";
import { assertNoDatabaseError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

const ATTACHMENT_STORES = {
  expense: { bucket: "expense-attachments", table: "expense_attachments" },
  studyNote: {
    bucket: "study-note-attachments",
    table: "study_note_attachments",
  },
  clinicalRecord: {
    bucket: "clinical-record-attachments",
    table: "clinical_record_attachments",
  },
} as const;

const ENCRYPTED_FILE_CONTENT_TYPE = "application/octet-stream";

const attachmentIdSchema = z.uuid();

type AttachmentStore = keyof typeof ATTACHMENT_STORES;

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type DatabaseResponse = PromiseLike<{ error: unknown }>;

type StoredFilesResponse = PromiseLike<{
  data: { storage_path: string }[] | null;
  error: unknown;
}>;

type ValidAttachmentUpload = Extract<AttachmentUpload, { isValid: true }>;

type AttachmentRowFields = {
  id: string;
  psychologist_id: UserId;
  storage_path: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
};

type StoreAttachmentOptions = {
  store: AttachmentStore;
  psychologistId: UserId;
  itemId: string;
  upload: ValidAttachmentUpload;
  encrypt?: (content: Uint8Array) => Uint8Array;
  insertRow: (
    supabase: SupabaseClient,
    fields: AttachmentRowFields,
  ) => DatabaseResponse;
};

type DeleteAttachmentOptions = {
  store: AttachmentStore;
  attachmentId: string;
  failureMessage: string;
  deleteRow: (
    supabase: SupabaseClient,
    attachmentId: string,
  ) => StoredFilesResponse;
};

type ServeAttachmentOptions = {
  store: AttachmentStore;
  attachmentId: string;
  prepare?: (file: {
    content: Uint8Array;
    attachmentId: string;
    psychologistId: UserId;
  }) => Promise<Uint8Array>;
};

export async function storeAttachment({
  store,
  psychologistId,
  itemId,
  upload,
  encrypt,
  insertRow,
}: StoreAttachmentOptions): Promise<string | null> {
  const { bucket } = ATTACHMENT_STORES[store];
  const attachmentId = crypto.randomUUID();
  const storagePath = `${psychologistId}/${itemId}/${attachmentId}`;
  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, encrypt ? encrypt(upload.content) : upload.content, {
      contentType: encrypt ? ENCRYPTED_FILE_CONTENT_TYPE : upload.contentType,
      upsert: false,
    });
  if (uploadError) return null;

  const { error } = await insertRow(supabase, {
    id: attachmentId,
    psychologist_id: psychologistId,
    storage_path: storagePath,
    file_name: upload.fileName,
    content_type: upload.contentType,
    size_bytes: upload.sizeBytes,
  });
  if (error) {
    await supabase.storage.from(bucket).remove([storagePath]);
    return null;
  }
  return attachmentId;
}

export async function removeAttachmentFiles(
  store: AttachmentStore,
  storagePaths: readonly string[],
): Promise<void> {
  if (storagePaths.length === 0) return;
  const supabase = await createClient();
  await supabase.storage
    .from(ATTACHMENT_STORES[store].bucket)
    .remove([...storagePaths]);
}

export async function deleteAttachment({
  store,
  attachmentId,
  failureMessage,
  deleteRow,
}: DeleteAttachmentOptions): Promise<ActionResult> {
  const parsedId = attachmentIdSchema.safeParse(attachmentId);
  if (!parsedId.success) return actionFailure(INVALID_FORM_MESSAGE);

  const supabase = await createClient();
  const { data, error } = await deleteRow(supabase, parsedId.data);
  if (error || !data) return actionFailure(failureMessage);
  if (data.length === 0) {
    return actionFailure(ATTACHMENT_UPLOAD_MESSAGES.notFound);
  }
  await removeAttachmentFiles(
    store,
    data.map(({ storage_path }) => storage_path),
  );
  return actionSuccess();
}

export async function serveAttachment({
  store,
  attachmentId,
  prepare,
}: ServeAttachmentOptions): Promise<Response> {
  const psychologist = await getAuthorizedPsychologist();
  if (!psychologist) return new Response(null, { status: 401 });
  const parsedId = attachmentIdSchema.safeParse(attachmentId);
  if (!parsedId.success) return new Response(null, { status: 404 });

  const { bucket, table } = ATTACHMENT_STORES[store];
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from(table)
    .select(`${ATTACHMENT_COLUMNS}, storage_path`)
    .eq("id", parsedId.data)
    .maybeSingle();
  assertNoDatabaseError(error);
  if (!row) return new Response(null, { status: 404 });

  const { data: file, error: downloadError } = await supabase.storage
    .from(bucket)
    .download(row.storage_path);
  if (downloadError) return new Response(null, { status: 404 });

  const content = new Uint8Array(await file.arrayBuffer());
  const body = prepare
    ? await prepare({
        content,
        attachmentId: parsedId.data,
        psychologistId: psychologist.id,
      })
    : content;
  return buildAttachmentResponse(body, toAttachment(row));
}
