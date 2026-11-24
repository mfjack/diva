import { z } from "zod";
import { richTextDocumentSchema } from "@/lib/rich-text";

const STUDY_NOTE_TAG_MAX_LENGTH = 40;
const STUDY_NOTE_KIND_MAX_LENGTH = 40;
export const STUDY_NOTE_MAX_TAGS = 10;

const tagSchema = z
  .string()
  .trim()
  .min(1)
  .max(STUDY_NOTE_TAG_MAX_LENGTH, "Tema muito longo.");

const optionalUrlSchema = z.union([
  z.literal(""),
  z.url({ protocol: /^https?$/, error: "Use um link que comece com http." }),
]);

export const studyNoteSchema = z.object({
  title: z.string().trim().max(160, "Título muito longo."),
  kind: z
    .string()
    .trim()
    .min(1, "Informe o tipo.")
    .max(STUDY_NOTE_KIND_MAX_LENGTH, "Tipo muito longo."),
  content: richTextDocumentSchema,
  tags: z
    .array(tagSchema)
    .max(STUDY_NOTE_MAX_TAGS, `Use até ${STUDY_NOTE_MAX_TAGS} temas.`),
  sourceTitle: z.string().trim().max(200, "Texto muito longo."),
  sourceAuthor: z.string().trim().max(160, "Texto muito longo."),
  sourceUrl: optionalUrlSchema,
});

export type StudyNoteInput = z.infer<typeof studyNoteSchema>;
