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
};

export function PaymentStatusBadge({
  status,
  isSessionUpcoming = false,
}: PaymentStatusBadgeProps) {
  if (status === "pending" && isSessionUpcoming) {
    return <StatusBadge tone="neutral">A cobrar</StatusBadge>;
  }

  return (
    <StatusBadge tone={PAYMENT_STATUS_TONES[status]}>
      {PAYMENT_STATUS_LABELS[status]}
    </StatusBadge>
  );
}
