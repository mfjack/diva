import { describe, expect, it } from "vitest";
import { EMPTY_RICH_TEXT } from "@/lib/rich-text";
import { type StudyNoteInput, studyNoteSchema } from "./schemas";

const validNote: StudyNoteInput = {
  title: "Luto em adultos",
  kind: "reading",
  content: EMPTY_RICH_TEXT,
  tags: ["luto", "adultos"],
  sourceTitle: "Aconselhamento do luto",
  sourceAuthor: "J. William Worden",
  sourceUrl: "",
};

describe("studyNoteSchema", () => {
  it("accepts a valid note", () => {
    expect(studyNoteSchema.safeParse(validNote).success).toBe(true);
  });

  it("accepts http links only", () => {
    expect(
      studyNoteSchema.safeParse({
        ...validNote,
        sourceUrl: "https://exemplo.com",
      }).success,
    ).toBe(true);
    expect(
      studyNoteSchema.safeParse({
        ...validNote,
        sourceUrl: "javascript:alert(1)",
      }).success,
    ).toBe(false);
  });

  it("limits the number of tags", () => {
    expect(
      studyNoteSchema.safeParse({
        ...validNote,
        tags: Array.from({ length: 11 }, (_, index) => `tema ${index}`),
      }).success,
    ).toBe(false);
  });
});
