import { z } from "zod";

const CLINICAL_RECORD_CONTENT_MAX_LENGTH = 20_000;

export const clinicalRecordSchema = z.object({
  patientId: z
    .string({ error: "Escolha o paciente." })
    .min(1, "Escolha o paciente."),
  appointmentId: z.union([z.literal(""), z.uuid("Escolha a sessão.")]),
  title: z
    .string()
    .trim()
    .min(1, "Dê um título às anotações.")
    .max(200, "Título muito longo."),
  content: z
    .string()
    .trim()
    .min(1, "Escreva as anotações da sessão.")
    .max(CLINICAL_RECORD_CONTENT_MAX_LENGTH, "Texto muito longo."),
});

export type ClinicalRecordInput = z.infer<typeof clinicalRecordSchema>;

export const patientSessionsSchema = z.uuid();
