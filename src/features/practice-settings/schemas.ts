import { z } from "zod";
import { fullNameSchema } from "@/features/auth/schemas";
import { timeToMinutes } from "@/lib/time-slots";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const ANY_MODALITY = "any";

export const AVAILABILITY_MODALITY_OPTIONS = [
  { value: ANY_MODALITY, label: "Presencial ou online" },
  { value: "in_person", label: "Só presencial" },
  { value: "online", label: "Só online" },
] as const;

function wholeNumber(label: string, min: number, max: number) {
  return z
    .number({ error: `Informe ${label}.` })
    .int("Use um número inteiro.")
    .min(min, `O mínimo é ${min}.`)
    .max(max, `O máximo é ${max}.`);
}

export const practiceSettingsSchema = z.object({
  psychologistName: fullNameSchema,
  professionalRegistration: z
    .string()
    .trim()
    .min(3, "Informe seu número de registro no CRP.")
    .max(30, "Registro muito longo."),
  sessionDurationMinutes: wholeNumber("a duração da sessão", 15, 240),
  defaultSessionPrice: z
    .number({ error: "Informe o valor da sessão." })
    .nonnegative("O valor não pode ser negativo."),
  cancellationNoticeHours: wholeNumber("a antecedência", 0, 168),
  bookingWindowDays: wholeNumber("a janela de agendamento", 1, 365),
  minimumBookingNoticeHours: wholeNumber("a antecedência mínima", 0, 168),
  pixKey: z.string().trim().max(140, "Chave muito longa."),
  officeAddress: z.string().trim().max(300, "Endereço muito longo."),
  bio: z.string().trim().max(1000, "Texto muito longo."),
});

export type PracticeSettingsInput = z.infer<typeof practiceSettingsSchema>;

const availabilityIntervalSchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    startTime: z.string().regex(TIME_PATTERN, "Horário inválido."),
    endTime: z.string().regex(TIME_PATTERN, "Horário inválido."),
    modality: z.enum([ANY_MODALITY, "in_person", "online"]),
  })
  .refine(
    ({ startTime, endTime }) =>
      timeToMinutes(endTime) > timeToMinutes(startTime),
    { message: "O fim deve ser depois do início.", path: ["endTime"] },
  );

export type AvailabilityIntervalInput = z.infer<
  typeof availabilityIntervalSchema
>;

export const weeklyAvailabilitySchema = z
  .object({ intervals: z.array(availabilityIntervalSchema) })
  .superRefine(({ intervals }, context) => {
    intervals.forEach((interval, index) => {
      const overlapsAnotherInterval = intervals.some(
        (otherInterval, otherIndex) =>
          otherIndex < index &&
          otherInterval.weekday === interval.weekday &&
          timeToMinutes(interval.startTime) <
            timeToMinutes(otherInterval.endTime) &&
          timeToMinutes(interval.endTime) >
            timeToMinutes(otherInterval.startTime),
      );
      if (overlapsAnotherInterval) {
        context.addIssue({
          code: "custom",
          message: "Esse horário se sobrepõe a outro no mesmo dia.",
          path: ["intervals", index, "startTime"],
        });
      }
    });
  });

export type WeeklyAvailabilityInput = z.infer<typeof weeklyAvailabilitySchema>;

export const availabilityBlockSchema = z
  .object({
    startDate: z.iso.date({ error: "Informe a data de início." }),
    startTime: z.string().regex(TIME_PATTERN, "Informe o horário."),
    endDate: z.iso.date({ error: "Informe a data de fim." }),
    endTime: z.string().regex(TIME_PATTERN, "Informe o horário."),
    reason: z.string().trim().max(200, "Texto muito longo."),
  })
  .refine(
    ({ startDate, startTime, endDate, endTime }) =>
      `${endDate}T${endTime}` > `${startDate}T${startTime}`,
    { message: "O fim deve ser depois do início.", path: ["endDate"] },
  );

export type AvailabilityBlockInput = z.infer<typeof availabilityBlockSchema>;
