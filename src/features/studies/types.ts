import type { Attachment } from "@/lib/attachments";
import type { Brand } from "@/lib/brand";
import type { RichTextDocument } from "@/lib/rich-text";

export const DEFAULT_STUDY_NOTE_KINDS = [
  "Anotação",
  "Reflexão",
  "Leitura",
  "Supervisão",
  "Curso/aula",
] as const;

export type StudyNoteId = Brand<string, "StudyNoteId">;

export type StudyNoteAttachmentId = Brand<string, "StudyNoteAttachmentId">;

export type StudyNoteAttachment = Attachment & { id: StudyNoteAttachmentId };

type StudyNoteSource = {
  title: string;
  author: string;
  url: string;
};

export type StudyNote = {
  id: StudyNoteId;
  title: string;
  kind: string;
  content: RichTextDocument;
  plainText: string;
  tags: string[];
  source: StudyNoteSource | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  attachments: StudyNoteAttachment[];
};

export type StudyNoteSummary = Omit<
  StudyNote,
  "content" | "plainText" | "attachments"
> & {
  excerpt: string;
};

export type StudyNoteFilters = {
  search: string;
  kind: string | null;
  tag: string | null;
};
