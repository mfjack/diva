import type { StudyNote, StudyNoteFilters, StudyNoteSummary } from "./types";

const EXCERPT_MAX_LENGTH = 140;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function matchesFilters(
  note: StudyNote,
  { search, kind, tag }: StudyNoteFilters,
): boolean {
  if (kind !== null && note.kind !== kind) return false;
  if (tag !== null && !note.tags.includes(tag)) return false;
  const query = normalize(search.trim());
  if (query === "") return true;
  return [note.title, note.plainText, ...note.tags, note.source?.title ?? ""]
    .map(normalize)
    .some((text) => text.includes(query));
}

function compareNotes(first: StudyNote, second: StudyNote): number {
  if (first.isPinned !== second.isPinned) return first.isPinned ? -1 : 1;
  return second.updatedAt.localeCompare(first.updatedAt);
}

function toExcerpt(plainText: string): string {
  return plainText.length > EXCERPT_MAX_LENGTH
    ? `${plainText.slice(0, EXCERPT_MAX_LENGTH).trimEnd()}…`
    : plainText;
}

function toStudyNoteSummary({
  content: _content,
  plainText,
  ...note
}: StudyNote): StudyNoteSummary {
  return { ...note, excerpt: toExcerpt(plainText) };
}

export function listStudyNoteSummaries(
  notes: readonly StudyNote[],
  filters: StudyNoteFilters,
): StudyNoteSummary[] {
  return notes
    .filter((note) => matchesFilters(note, filters))
    .sort(compareNotes)
    .map(toStudyNoteSummary);
}

export function listStudyNoteTags(notes: readonly StudyNote[]): string[] {
  return [...new Set(notes.flatMap(({ tags }) => tags))].sort((first, second) =>
    first.localeCompare(second, "pt-BR"),
  );
}

export function normalizeTags(tags: readonly string[]): string[] {
  const seen = new Set<string>();
  return tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => {
      if (tag === "" || seen.has(tag)) return false;
      seen.add(tag);
      return true;
    });
}
