import { z } from "zod";

export type RichTextNode = {
  type: string;
  text?: string;
  content?: RichTextNode[];
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

export type RichTextDocument = {
  type: "doc";
  content?: RichTextNode[];
};

const RICH_TEXT_MAX_LENGTH = 200_000;

const BLOCK_SEPARATOR = " ";

export const EMPTY_RICH_TEXT: RichTextDocument = { type: "doc", content: [] };

const richTextNodeSchema: z.ZodType<RichTextNode, RichTextNode> = z.lazy(() =>
  z.object({
    type: z.string().min(1),
    text: z.string().optional(),
    content: z.array(richTextNodeSchema).optional(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    marks: z
      .array(
        z.object({
          type: z.string().min(1),
          attrs: z.record(z.string(), z.unknown()).optional(),
        }),
      )
      .optional(),
  }),
);

export const richTextDocumentSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(richTextNodeSchema).optional(),
  })
  .refine(
    (document) => JSON.stringify(document).length <= RICH_TEXT_MAX_LENGTH,
    "Texto muito longo.",
  );

function collectText(node: RichTextNode): string {
  if (node.text) return node.text;
  return (node.content ?? []).map(collectText).join(BLOCK_SEPARATOR);
}

export function getRichTextPlainText(document: RichTextDocument): string {
  return (document.content ?? [])
    .map(collectText)
    .join(BLOCK_SEPARATOR)
    .replace(/\s+/g, " ")
    .trim();
}
