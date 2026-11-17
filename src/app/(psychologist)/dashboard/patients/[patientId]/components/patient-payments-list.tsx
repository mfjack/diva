import { EmptyListMessage } from "@/components/feedback/empty-list-message";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { PAYMENT_METHOD_LABELS } from "@/features/payments/labels";
import type { Payment } from "@/features/payments/types";
import { formatCurrency, formatDate } from "@/lib/format";

type PatientPaymentsListProps = {
  payments: Payment[];
};

export function PatientPaymentsList({ payments }: PatientPaymentsListProps) {
  if (payments.length === 0) {
    return <EmptyListMessage message="Nenhum pagamento registrado." />;
  }

  return (
    <ul className="divide-y rounded-xl border px-4">
      {payments.map((payment) => (
        <li key={payment.id} className="flex items-center gap-4 py-3 text-sm">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-medium">
              Sessão de {formatDate(payment.sessionStartsAt)}
            </span>
            <span className="text-muted-foreground text-xs">
              {payment.method
                ? PAYMENT_METHOD_LABELS[payment.method]
                : "Aguardando pagamento"}
              {payment.receiptNumber && ` · Recibo nº ${payment.receiptNumber}`}
            </span>
          </div>
          <PaymentStatusBadge status={payment.status} />
          <span className="w-24 shrink-0 text-right font-semibold tabular-nums">
            {formatCurrency(payment.amountCents)}
          </span>
        </li>
      ))}
    </ul>
  );
}
