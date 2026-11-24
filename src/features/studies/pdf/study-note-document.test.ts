import { describe, expect, it } from "vitest";
import type { StudyNote, StudyNoteId } from "../types";
import { renderStudyNotePdf } from "./study-note-document";

const note: StudyNote = {
  id: "note-1" as StudyNoteId,
  title: "Reflexão sobre vínculo",
  kind: "Reflexão",
  attachments: [],
  content: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Ideia central" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "O vínculo é " },
          { type: "text", text: "construção", marks: [{ type: "bold" }] },
          { type: "text", text: " contínua." },
        ],
      },
    ],
  },
  plainText: "Ideia central O vínculo é construção contínua.",
  tags: ["vínculo"],
  source: null,
  isPinned: false,
  createdAt: "2026-11-17T12:00:00.000Z",
  updatedAt: "2026-11-17T12:00:00.000Z",
};

describe("renderStudyNotePdf", () => {
  it("renders a PDF that embeds the Poppins font", async () => {
    const pdf = await renderStudyNotePdf(note);
    const content = pdf.toString("latin1");
    expect(content.startsWith("%PDF")).toBe(true);
    expect(content).toContain("Poppins");
  });
});
