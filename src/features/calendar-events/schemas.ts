import { differenceInCalendarDays } from "date-fns";
import { z } from "zod";
import { dateKeyToLocalDate } from "@/lib/dates";
import { timeToMinutes } from "@/lib/time-slots";
import { EVENT_REPEATS, MAX_EVENT_REPEAT_DAYS } from "./recurrence";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeSchema = (message: string) =>
  z.string({ error: message }).regex(TIME_PATTERN, message);

export const calendarEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Dê um nome ao evento.")
      .max(120, "Nome muito longo."),
    date: z.iso.date({ error: "Escolha a data." }),
    startTime: timeSchema("Escolha o início."),
    endTime: timeSchema("Escolha o fim."),
    notes: z.string().trim().max(500, "Texto muito longo."),
    repeat: z.enum(EVENT_REPEATS),
    repeatUntil: z.union([z.literal(""), z.iso.date("Data inválida.")]),
  })
  .refine(
    ({ startTime, endTime }) =>
      timeToMinutes(endTime) > timeToMinutes(startTime),
    { path: ["endTime"], message: "O fim deve ser depois do início." },
  )
  .refine(
    ({ repeat, repeatUntil }) => repeat === "none" || repeatUntil !== "",
    {
      path: ["repeatUntil"],
      message: "Informe até quando o evento se repete.",
    },
  )
  .refine(
    ({ repeat, date, repeatUntil }) =>
      repeat === "none" ||
      repeatUntil === "" ||
      (repeatUntil >= date &&
        differenceInCalendarDays(
          dateKeyToLocalDate(repeatUntil),
          dateKeyToLocalDate(date),
        ) <= MAX_EVENT_REPEAT_DAYS),
    {
      path: ["repeatUntil"],
      message: "Escolha uma data depois do evento e em até 6 meses.",
    },
  );

export type CalendarEventInput = z.infer<typeof calendarEventSchema>;

const EVENT_DELETE_SCOPES = ["single", "following"] as const;

export const deleteCalendarEventSchema = z.object({
  scope: z.enum(EVENT_DELETE_SCOPES),
});

export type DeleteCalendarEventInput = z.infer<
  typeof deleteCalendarEventSchema
>;
