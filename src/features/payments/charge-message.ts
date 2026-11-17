import { formatCurrency, formatDate } from "@/lib/format";
import type { Cents } from "@/lib/money";
import type { Payment } from "./types";

export type ChargeItem = Pick<Payment, "sessionStartsAt" | "amountCents">;

export type ChargeMessageParts = {
  patientName: string;
  items: readonly ChargeItem[];
  pixKey: string | null;
};

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "";
}

function sumItems(items: readonly ChargeItem[]): Cents {
  return items.reduce((total, item) => total + item.amountCents, 0) as Cents;
}

function describeItems(items: readonly ChargeItem[]): string {
  const [singleItem] = items;
  if (items.length === 1 && singleItem) {
    return `Passando para lembrar do pagamento da sessão de ${formatDate(singleItem.sessionStartsAt)}, no valor de ${formatCurrency(singleItem.amountCents)}.`;
  }

  const sortedItems = [...items].sort((first, second) =>
    first.sessionStartsAt.localeCompare(second.sessionStartsAt),
  );
  const lines = sortedItems.map(
    (item) =>
      `• Sessão de ${formatDate(item.sessionStartsAt)}: ${formatCurrency(item.amountCents)}`,
  );
  return [
    "Passando para lembrar dos pagamentos em aberto:",
    ...lines,
    `Total: ${formatCurrency(sumItems(items))}`,
  ].join("\n");
}

export function buildChargeMessage({
  patientName,
  items,
  pixKey,
}: ChargeMessageParts): string {
  return [
    `Olá, ${getFirstName(patientName)}! Tudo bem?`,
    describeItems(items),
    pixKey ? `Para pagar via Pix, use a chave: ${pixKey}` : null,
    "Se o pagamento já foi feito, por favor desconsidere esta mensagem. Qualquer dúvida, estou à disposição.",
  ]
    .filter((paragraph) => paragraph !== null)
    .join("\n\n");
}
