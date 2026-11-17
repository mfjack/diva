import type { Brand } from "@/lib/brand";
import type { RichTextDocument } from "@/lib/rich-text";

export const STUDY_NOTE_KINDS = [
  "note",
  "reflection",
  "reading",
  "supervision",
  "course",
] as const;

export type StudyNoteKind = (typeof STUDY_NOTE_KINDS)[number];

export type StudyNoteId = Brand<string, "StudyNoteId">;

export type StudyNoteSource = {
  title: string;
  author: string;
  url: string;
};

export type StudyNote = {
  id: StudyNoteId;
  title: string;
  kind: StudyNoteKind;
  content: RichTextDocument;
  plainText: string;
  tags: string[];
  source: StudyNoteSource | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StudyNoteSummary = Omit<StudyNote, "content" | "plainText"> & {
  excerpt: string;
};

export type StudyNoteFilters = {
  search: string;
  kind: StudyNoteKind | null;
  tag: string | null;
};
