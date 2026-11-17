import { z } from "zod";

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Informe seu nome.")
  .max(120, "Nome muito longo.");

export const acceptTermsSchema = z.object({
  hasAccepted: z
    .boolean()
    .refine(
      (hasAccepted) => hasAccepted,
      "Para continuar, aceite os termos e a política de privacidade.",
    ),
});

export type AcceptTermsInput = z.infer<typeof acceptTermsSchema>;
