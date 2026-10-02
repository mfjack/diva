import { formatCurrency, formatDate } from "@/lib/format";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import type { Payment } from "./types";

export function getChargeWhatsAppUrl(
  payment: Pick<
    Payment,
    "patientName" | "patientPhone" | "amountCents" | "sessionStartsAt"
  >,
  pixKey: string | null,
): string | null {
  if (!payment.patientPhone) return null;

  const firstName = payment.patientName.split(" ")[0] ?? "";
  const pixLine = pixKey ? ` Chave Pix: ${pixKey}.` : "";
  const message = `Olá, ${firstName}! Passando para lembrar do pagamento da sessão de ${formatDate(payment.sessionStartsAt)}, no valor de ${formatCurrency(payment.amountCents)}.${pixLine} Obrigada!`;

  return getWhatsAppUrl(payment.patientPhone, message);
}
