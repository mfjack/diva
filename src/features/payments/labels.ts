import type { PaymentMethod, PaymentStatus } from "./types";

export const PAYMENT_STATUS_LABELS = {
  pending: "Pendente",
  paid: "Pago",
  waived: "Isento",
  refunded: "Estornado",
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
