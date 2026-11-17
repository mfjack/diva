import { z } from "zod";
import { Constants } from "@/lib/supabase/database.types";

export const registerPaymentSchema = z.object({
  method: z.enum(Constants.public.Enums.payment_method, {
    error: "Escolha a forma.",
  }),
  paidOn: z.iso.date({ error: "Informe a data." }),
  notes: z.string().trim().max(300, "Observação muito longa."),
});

export type RegisterPaymentInput = z.infer<typeof registerPaymentSchema>;

export const chargeMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Escreva a mensagem de cobrança.")
    .max(2000, "Mensagem muito longa."),
});

export type ChargeMessageInput = z.infer<typeof chargeMessageSchema>;
