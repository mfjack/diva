import "server-only";

import type { StudyNote } from "@/features/studies/types";
import { getMockDatabase, saveMockDatabase } from "./store";

function isActive(note: { deletedAt?: string | null }): boolean {
  return !note.deletedAt;
}

export function listMockStudyNotes(): StudyNote[] {
  return getMockDatabase().studyNotes.filter(isActive);
}

export function findMockStudyNote(noteId: string): StudyNote | undefined {
  return listMockStudyNotes().find(({ id }) => id === noteId);
}

export function insertMockStudyNote(note: StudyNote): void {
  getMockDatabase().studyNotes.push(note);
  saveMockDatabase();
}

export function updateMockStudyNote(
  noteId: string,
  changes: Partial<Omit<StudyNote, "id">>,
): void {
  const note = getMockDatabase().studyNotes.find(({ id }) => id === noteId);
  if (!note) return;
  Object.assign(note, changes);
  saveMockDatabase();
}

export function softDeleteMockStudyNote(noteId: string): void {
  const note = getMockDatabase().studyNotes.find(({ id }) => id === noteId);
  if (!note) return;
  note.deletedAt = new Date().toISOString();
  saveMockDatabase();
}
