import { z } from "zod";
import { Constants } from "@/lib/supabase/database.types";

export const bookAppointmentSchema = z.object({
  startsAt: z.iso.datetime({ error: "Escolha um horário." }),
  modality: z.enum(Constants.public.Enums.appointment_modality, {
    error: "Escolha presencial ou online.",
  }),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
