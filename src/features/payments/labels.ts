import type {
  PaymentMethod,
  PaymentPlan,
  PaymentStatus,
  PaymentTerms,
} from "./types";

export const PAYMENT_STATUS_LABELS = {
  pending: "Pagamento pendente",
  paid: "Pagamento realizado",
  waived: "Sem cobrança",
  refunded: "Pagamento estornado",
} as const satisfies Record<PaymentStatus, string>;

export const PAYMENT_METHOD_LABELS = {
  pix: "Pix",
  cash: "Dinheiro",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  bank_transfer: "Transferência",
} as const satisfies Record<PaymentMethod, string>;

export const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const PAYMENT_PLAN_LABELS = {
  per_session: "Por sessão",
  monthly: "Mensal",
} as const satisfies Record<PaymentPlan, string>;

export const PAYMENT_PLAN_DESCRIPTIONS = {
  per_session: "Paga no dia de cada sessão. Depois do horário, fica em atraso.",
  monthly:
    "Paga as sessões do mês até o dia escolhido. Depois dele, fica em atraso.",
} as const satisfies Record<PaymentPlan, string>;

export const PAYMENT_PLAN_OPTIONS = Object.entries(PAYMENT_PLAN_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export function describePaymentTerms({
  paymentPlan,
  billingDay,
}: PaymentTerms): string {
  const label = PAYMENT_PLAN_LABELS[paymentPlan];
  return paymentPlan === "monthly" && billingDay
    ? `${label}, até o dia ${billingDay}`
    : label;
}
