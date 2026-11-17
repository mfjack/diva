import { z } from "zod";
import { CANCELLATION_REASONS } from "./labels";
import { SESSION_REPEATS } from "./recurring-sessions";

const CANCELLATION_REASON_VALUES = CANCELLATION_REASONS.map(
  ({ value }) => value,
) as [
  (typeof CANCELLATION_REASONS)[number]["value"],
  ...(typeof CANCELLATION_REASONS)[number]["value"][],
];

const CANCELLATION_DETAILS_MIN_LENGTH = 10;
const CANCELLATION_DETAILS_MAX_LENGTH = 400;

const CANCELLATION_SCOPES = ["single", "following"] as const;

export const cancelAppointmentSchema = z.object({
  scope: z.enum(CANCELLATION_SCOPES),
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

export const appointmentStatusUpdateSchema = z.enum([
  "confirmed",
  "completed",
  "no_show",
]);

export type AppointmentStatusUpdate = z.infer<
  typeof appointmentStatusUpdateSchema
>;

const appointmentSlotShape = {
  date: z.iso.date({ error: "Informe a data." }),
  time: z.iso.time({ precision: -1, error: "Informe o horário." }),
};

const sessionPlanShape = {
  ...appointmentSlotShape,
  repeat: z.enum(SESSION_REPEATS),
};

export const sessionPlanSchema = z.object(sessionPlanShape);

export type SessionPlanSchemaInput = z.infer<typeof sessionPlanSchema>;

export const createAppointmentSchema = z.object({
  patientId: z
    .string({ error: "Escolha o paciente." })
    .min(1, "Escolha o paciente."),
  ...sessionPlanShape,
  excludedDates: z.array(z.iso.date()).max(31),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const rescheduleAppointmentSchema = z.object(appointmentSlotShape);

export type RescheduleAppointmentInput = z.infer<
  typeof rescheduleAppointmentSchema
>;

export function formatCancellationReason({
  reasonCategory,
  details,
}: CancelAppointmentInput): string {
  const label =
    CANCELLATION_REASONS.find(({ value }) => value === reasonCategory)?.label ??
    "";
  return `${label}: ${details.trim()}`;
}
