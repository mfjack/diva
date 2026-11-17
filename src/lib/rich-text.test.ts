import { describe, expect, it } from "vitest";
import {
  EMPTY_RICH_TEXT,
  getRichTextPlainText,
  type RichTextDocument,
  richTextDocumentSchema,
} from "./rich-text";

const document: RichTextDocument = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Luto" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Leitura de " },
        { type: "text", text: "Worden", marks: [{ type: "bold" }] },
      ],
    },
  ],
};

describe("getRichTextPlainText", () => {
  it("joins the text of every block", () => {
    expect(getRichTextPlainText(document)).toBe("Luto Leitura de Worden");
  });

  it("returns an empty string for an empty document", () => {
    expect(getRichTextPlainText(EMPTY_RICH_TEXT)).toBe("");
  });
});

describe("richTextDocumentSchema", () => {
  it("accepts editor documents", () => {
    expect(richTextDocumentSchema.safeParse(document).success).toBe(true);
  });

  it("rejects anything that is not a document", () => {
    expect(
      richTextDocumentSchema.safeParse({ type: "paragraph" }).success,
    ).toBe(false);
  });
});
