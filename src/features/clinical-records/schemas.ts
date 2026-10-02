import { z } from "zod";
import { Constants } from "@/lib/supabase/database.types";

export const CLINICAL_RECORD_CONTENT_MAX_LENGTH = 20_000;

export const clinicalRecordSchema = z.object({
  patientId: z
    .string({ error: "Escolha o paciente." })
    .min(1, "Escolha o paciente."),
  kind: z.enum(Constants.public.Enums.clinical_record_kind, {
    error: "Escolha o tipo de documento.",
  }),
  title: z
    .string()
    .trim()
    .min(1, "Dê um título ao documento.")
    .max(200, "Título muito longo."),
  content: z
    .string()
    .trim()
    .min(1, "Escreva o conteúdo do documento.")
    .max(CLINICAL_RECORD_CONTENT_MAX_LENGTH, "Texto muito longo."),
});

export type ClinicalRecordInput = z.infer<typeof clinicalRecordSchema>;
