"use server";

import { revalidatePath } from "next/cache";
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
import { EMPTY_RICH_TEXT, getRichTextPlainText } from "@/lib/rich-text";
import { ROUTES } from "@/lib/routes";
import {
  findMockStudyNote,
  insertMockStudyNote,
  softDeleteMockStudyNote,
  updateMockStudyNote,
} from "@/mocks/study-notes";
import { STUDY_NOTE_ACTION_MESSAGES } from "./messages";
import { normalizeTags } from "./note-list";
import { type StudyNoteInput, studyNoteSchema } from "./schemas";
import type { StudyNoteId } from "./types";

function findAuthorizedNote(noteId: string) {
  return findAuthorizedEntity(
    noteId,
    findMockStudyNote,
    STUDY_NOTE_ACTION_MESSAGES.notFound,
  );
}

function revalidateStudies(): void {
  revalidatePath(ROUTES.psychologist.studies);
}

export async function createStudyNote(): Promise<
  ActionResult<{ noteId: StudyNoteId }>
> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const now = new Date().toISOString();
  const noteId = crypto.randomUUID() as StudyNoteId;
  insertMockStudyNote({
    id: noteId,
    title: "",
    kind: "note",
    content: EMPTY_RICH_TEXT,
    plainText: "",
    tags: [],
    source: null,
    isPinned: false,
    createdAt: now,
    updatedAt: now,
  });
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
  updateMockStudyNote(lookup.entity.id, {
    title,
    kind,
    content,
    plainText: getRichTextPlainText(content),
    tags: normalizeTags(tags),
    source: hasSource
      ? { title: sourceTitle, author: sourceAuthor, url: sourceUrl }
      : null,
    updatedAt: savedAt,
  });
  revalidateStudies();
  return actionSuccess({ savedAt });
}

export async function toggleStudyNotePin(
  noteId: StudyNoteId,
): Promise<ActionResult> {
  const lookup = await findAuthorizedNote(noteId);
  if (!lookup.isFound) return lookup.failure;

  updateMockStudyNote(lookup.entity.id, { isPinned: !lookup.entity.isPinned });
  revalidateStudies();
  return actionSuccess();
}

export async function deleteStudyNote(
  noteId: StudyNoteId,
): Promise<ActionResult> {
  const lookup = await findAuthorizedNote(noteId);
  if (!lookup.isFound) return lookup.failure;

  softDeleteMockStudyNote(lookup.entity.id);
  revalidateStudies();
  return actionSuccess();
}
