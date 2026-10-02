import { z } from "zod";
import { CANCELLATION_REASONS } from "./labels";

const CANCELLATION_REASON_VALUES = CANCELLATION_REASONS.map(
  ({ value }) => value,
) as [
  (typeof CANCELLATION_REASONS)[number]["value"],
  ...(typeof CANCELLATION_REASONS)[number]["value"][],
];

export const CANCELLATION_DETAILS_MIN_LENGTH = 10;
export const CANCELLATION_DETAILS_MAX_LENGTH = 400;

export const cancelAppointmentSchema = z.object({
  reasonCategory: z.enum(CANCELLATION_REASON_VALUES, {
    error: "Escolha o motivo do cancelamento.",
  }),
  details: z
    .string()
    .trim()
    .min(
      CANCELLATION_DETAILS_MIN_LENGTH,
      `Conte um pouco mais (mínimo de ${CANCELLATION_DETAILS_MIN_LENGTH} caracteres).`,
    )
    .max(CANCELLATION_DETAILS_MAX_LENGTH, "Texto muito longo."),
});

export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;

export const appointmentStatusUpdateSchema = z.enum(["completed", "no_show"]);

export type AppointmentStatusUpdate = z.infer<
  typeof appointmentStatusUpdateSchema
>;

export const createAppointmentSchema = z.object({
  patientId: z
    .string({ error: "Escolha o paciente." })
    .min(1, "Escolha o paciente."),
  date: z.iso.date({ error: "Informe a data." }),
  time: z.iso.time({ precision: -1, error: "Informe o horário." }),
  modality: z.enum(["in_person", "online"], {
    error: "Escolha a modalidade.",
  }),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export function formatCancellationReason({
  reasonCategory,
  details,
}: CancelAppointmentInput): string {
  const label =
    CANCELLATION_REASONS.find(({ value }) => value === reasonCategory)?.label ??
    "";
  return `${label}: ${details.trim()}`;
}
