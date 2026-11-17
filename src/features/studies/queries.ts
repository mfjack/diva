import "server-only";

import { findMockStudyNote, listMockStudyNotes } from "@/mocks/study-notes";
import { listStudyNoteSummaries, listStudyNoteTags } from "./note-list";
import type { StudyNote, StudyNoteFilters, StudyNoteSummary } from "./types";

export async function listStudyNotes(
  filters: StudyNoteFilters,
): Promise<StudyNoteSummary[]> {
  return listStudyNoteSummaries(listMockStudyNotes(), filters);
}

export async function listStudyTags(): Promise<string[]> {
  return listStudyNoteTags(listMockStudyNotes());
}

export async function getStudyNote(noteId: string): Promise<StudyNote | null> {
  return findMockStudyNote(noteId) ?? null;
}

export async function hasStudyNotes(): Promise<boolean> {
  return listMockStudyNotes().length > 0;
}
