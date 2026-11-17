import { describe, expect, it } from "vitest";
import { EMPTY_RICH_TEXT } from "@/lib/rich-text";
import {
  listStudyNoteSummaries,
  listStudyNoteTags,
  normalizeTags,
} from "./note-list";
import type { StudyNote, StudyNoteFilters, StudyNoteId } from "./types";

const NO_FILTERS: StudyNoteFilters = { search: "", kind: null, tag: null };

function createNote(overrides: Partial<StudyNote>): StudyNote {
  return {
    id: "note-1" as StudyNoteId,
    title: "Sem título",
    kind: "note",
    content: EMPTY_RICH_TEXT,
    plainText: "",
    tags: [],
    source: null,
    isPinned: false,
    createdAt: "2026-11-01T12:00:00.000Z",
    updatedAt: "2026-11-01T12:00:00.000Z",
    ...overrides,
  };
}

const notes = [
  createNote({
    id: "old" as StudyNoteId,
    title: "Reflexão sobre vínculo",
    kind: "reflection",
    updatedAt: "2026-11-01T12:00:00.000Z",
  }),
  createNote({
    id: "recent" as StudyNoteId,
    title: "Luto",
    kind: "reading",
    tags: ["luto"],
    plainText: "Modelo de tarefas do luto de Worden",
    updatedAt: "2026-11-10T12:00:00.000Z",
  }),
  createNote({
    id: "pinned" as StudyNoteId,
    title: "Supervisão de casos",
    kind: "supervision",
    tags: ["tcc"],
    isPinned: true,
    updatedAt: "2026-10-01T12:00:00.000Z",
  }),
];

describe("listStudyNoteSummaries", () => {
  it("puts pinned notes first, then the most recently edited", () => {
    expect(
      listStudyNoteSummaries(notes, NO_FILTERS).map(({ id }) => id),
    ).toEqual(["pinned", "recent", "old"]);
  });

  it("searches title, text and tags ignoring accents", () => {
    expect(
      listStudyNoteSummaries(notes, { ...NO_FILTERS, search: "vinculo" }).map(
        ({ id }) => id,
      ),
    ).toEqual(["old"]);
    expect(
      listStudyNoteSummaries(notes, { ...NO_FILTERS, search: "worden" }).map(
        ({ id }) => id,
      ),
    ).toEqual(["recent"]);
  });

  it("filters by kind and tag", () => {
    expect(
      listStudyNoteSummaries(notes, { ...NO_FILTERS, kind: "reading" }).map(
        ({ id }) => id,
      ),
    ).toEqual(["recent"]);
    expect(
      listStudyNoteSummaries(notes, { ...NO_FILTERS, tag: "tcc" }).map(
        ({ id }) => id,
      ),
    ).toEqual(["pinned"]);
  });

  it("builds a short excerpt from the text", () => {
    const [summary] = listStudyNoteSummaries(
      [createNote({ plainText: "a".repeat(200) })],
      NO_FILTERS,
    );
    expect(summary?.excerpt).toHaveLength(141);
  });
});

describe("listStudyNoteTags", () => {
  it("lists each tag once in alphabetical order", () => {
    expect(listStudyNoteTags(notes)).toEqual(["luto", "tcc"]);
  });
});

describe("normalizeTags", () => {
  it("trims, lowercases and removes duplicates", () => {
    expect(normalizeTags([" TCC ", "tcc", "", "Luto"])).toEqual([
      "tcc",
      "luto",
    ]);
  });
});
