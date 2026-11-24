import "server-only";

import { z } from "zod";
import { getCurrentUser } from "@/features/auth/queries";
import {
  EMPTY_RICH_TEXT,
  type RichTextDocument,
  richTextDocumentSchema,
} from "@/lib/rich-text";
import {
  ATTACHMENT_COLUMNS,
  sortAttachments,
  toAttachment,
} from "@/lib/supabase/attachment-rows";
import type { Tables } from "@/lib/supabase/database.types";
import { assertNoDatabaseError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import { listStudyNoteSummaries, listStudyNoteTags } from "./note-list";
import {
  DEFAULT_STUDY_NOTE_KINDS,
  type StudyNote,
  type StudyNoteAttachment,
  type StudyNoteAttachmentId,
  type StudyNoteFilters,
  type StudyNoteId,
  type StudyNoteSummary,
} from "./types";

type StudyNoteRow = Tables<"study_notes">;

const entityIdSchema = z.uuid();

function toRichText(content: StudyNoteRow["content"]): RichTextDocument {
  const parsedContent = richTextDocumentSchema.safeParse(content);
  return parsedContent.success ? parsedContent.data : EMPTY_RICH_TEXT;
}

function toStudyNote(
  row: StudyNoteRow,
  attachments: StudyNoteAttachment[] = [],
): StudyNote {
  const hasSource = Boolean(
    row.source_title || row.source_author || row.source_url,
  );
  return {
    id: row.id as StudyNoteId,
    title: row.title,
    kind: row.kind,
    content: toRichText(row.content),
    plainText: row.plain_text,
    tags: row.tags,
    source: hasSource
      ? {
          title: row.source_title ?? "",
          author: row.source_author ?? "",
          url: row.source_url ?? "",
        }
      : null,
    isPinned: row.is_pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachments,
  };
}

async function listActiveStudyNotes(): Promise<StudyNote[]> {
  if (!(await getCurrentUser())) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_notes")
    .select("*")
    .is("deleted_at", null);
  assertNoDatabaseError(error);
  return (data ?? []).map((row) => toStudyNote(row));
}

export async function listStudyNotes(
  filters: StudyNoteFilters,
): Promise<StudyNoteSummary[]> {
  return listStudyNoteSummaries(await listActiveStudyNotes(), filters);
}

export async function listStudyTags(): Promise<string[]> {
  return listStudyNoteTags(await listActiveStudyNotes());
}

export async function listStudyKinds(): Promise<string[]> {
  const notes = await listActiveStudyNotes();
  const customKinds = notes
    .map(({ kind }) => kind)
    .filter(
      (kind) =>
        !DEFAULT_STUDY_NOTE_KINDS.some((defaultKind) => defaultKind === kind),
    )
    .sort((first, second) => first.localeCompare(second, "pt-BR"));
  return [...DEFAULT_STUDY_NOTE_KINDS, ...new Set(customKinds)];
}

export async function getStudyNote(noteId: string): Promise<StudyNote | null> {
  const parsedId = entityIdSchema.safeParse(noteId);
  if (!parsedId.success || !(await getCurrentUser())) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_notes")
    .select(`*, study_note_attachments (${ATTACHMENT_COLUMNS})`)
    .eq("id", parsedId.data)
    .is("deleted_at", null)
    .maybeSingle();
  assertNoDatabaseError(error);
  if (!data) return null;
  const { study_note_attachments: attachmentRows, ...row } = data;
  return toStudyNote(
    row,
    sortAttachments(attachmentRows.map(toAttachment<StudyNoteAttachmentId>)),
  );
}

export async function hasStudyNotes(): Promise<boolean> {
  if (!(await getCurrentUser())) return false;
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("study_notes")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null);
  assertNoDatabaseError(error);
  return (count ?? 0) > 0;
}

export async function getStudyNoteAttachmentFile(
  attachmentId: string,
): Promise<{ attachment: StudyNoteAttachment; storagePath: string } | null> {
  const parsedId = entityIdSchema.safeParse(attachmentId);
  if (!parsedId.success || !(await getCurrentUser())) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_note_attachments")
    .select(`${ATTACHMENT_COLUMNS}, storage_path`)
    .eq("id", parsedId.data)
    .maybeSingle();
  assertNoDatabaseError(error);
  if (!data) return null;
  return {
    attachment: toAttachment<StudyNoteAttachmentId>(data),
    storagePath: data.storage_path,
  };
}
