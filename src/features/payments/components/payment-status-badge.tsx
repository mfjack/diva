import { StatusBadge, type StatusTone } from "@/components/status-badge";
import { PAYMENT_STATUS_LABELS } from "../labels";
import type { PaymentStatus } from "../types";

const PAYMENT_STATUS_TONES = {
  pending: "warning",
  paid: "success",
  waived: "neutral",
  refunded: "destructive",
} as const satisfies Record<PaymentStatus, StatusTone>;

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
  isSessionUpcoming?: boolean;
  isOverdue?: boolean;
};

export function PaymentStatusBadge({
  status,
  isSessionUpcoming = false,
  isOverdue = false,
}: PaymentStatusBadgeProps) {
  if (status === "pending" && isOverdue) {
    return <StatusBadge tone="destructive">Pagamento atrasado</StatusBadge>;
  }

  if (status === "pending" && isSessionUpcoming) {
    return <StatusBadge tone="neutral">Pagamento a cobrar</StatusBadge>;
  }

  return (
    <StatusBadge tone={PAYMENT_STATUS_TONES[status]}>
      {PAYMENT_STATUS_LABELS[status]}
    </StatusBadge>
  );
}
