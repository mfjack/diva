import { z } from "zod";
import { Constants } from "@/lib/supabase/database.types";

export const registerPaymentSchema = z.object({
  method: z.enum(Constants.public.Enums.payment_method, {
    error: "Escolha a forma de pagamento.",
  }),
  paidOn: z.iso.date({ error: "Informe a data do pagamento." }),
  notes: z.string().trim().max(300, "Observação muito longa."),
});

export type RegisterPaymentInput = z.infer<typeof registerPaymentSchema>;
