import "server-only";

import { z } from "zod";
import { getCurrentUser } from "@/features/auth/queries";
import {
  EMPTY_RICH_TEXT,
  type RichTextDocument,
  richTextDocumentSchema,
} from "@/lib/rich-text";
import type { Tables } from "@/lib/supabase/database.types";
import { assertNoDatabaseError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import { listStudyNoteSummaries, listStudyNoteTags } from "./note-list";
import type {
  StudyNote,
  StudyNoteFilters,
  StudyNoteId,
  StudyNoteSummary,
} from "./types";

type StudyNoteRow = Tables<"study_notes">;

const noteIdSchema = z.uuid();

function toRichText(content: StudyNoteRow["content"]): RichTextDocument {
  const parsedContent = richTextDocumentSchema.safeParse(content);
  return parsedContent.success ? parsedContent.data : EMPTY_RICH_TEXT;
}

function toStudyNote(row: StudyNoteRow): StudyNote {
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
  return (data ?? []).map(toStudyNote);
}

export async function listStudyNotes(
  filters: StudyNoteFilters,
): Promise<StudyNoteSummary[]> {
  return listStudyNoteSummaries(await listActiveStudyNotes(), filters);
}

export async function listStudyTags(): Promise<string[]> {
  return listStudyNoteTags(await listActiveStudyNotes());
}

export async function getStudyNote(noteId: string): Promise<StudyNote | null> {
  const parsedId = noteIdSchema.safeParse(noteId);
  if (!parsedId.success || !(await getCurrentUser())) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_notes")
    .select("*")
    .eq("id", parsedId.data)
    .is("deleted_at", null)
    .maybeSingle();
  assertNoDatabaseError(error);
  return data ? toStudyNote(data) : null;
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
