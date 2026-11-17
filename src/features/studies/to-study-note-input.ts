import type { StudyNoteInput } from "./schemas";
import type { StudyNote } from "./types";

export function toStudyNoteInput(note: StudyNote): StudyNoteInput {
  return {
    title: note.title,
    kind: note.kind,
    content: note.content,
    tags: note.tags,
    sourceTitle: note.source?.title ?? "",
    sourceAuthor: note.source?.author ?? "",
    sourceUrl: note.source?.url ?? "",
  };
}
