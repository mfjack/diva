import { EmptyListMessage } from "@/components/feedback/empty-list-message";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { PAYMENT_METHOD_LABELS } from "@/features/payments/labels";
import type { Payment } from "@/features/payments/types";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Cents } from "@/lib/money";

type PatientPaymentsListProps = {
  payments: Payment[];
};

export function PatientPaymentsList({ payments }: PatientPaymentsListProps) {
  if (payments.length === 0) {
    return <EmptyListMessage message="Nenhum pagamento registrado." />;
  }

  const paidTotal = payments
    .filter(({ status }) => status === "paid")
    .reduce((total, { amountCents }) => total + amountCents, 0) as Cents;
  const pendingTotal = payments
    .filter(({ status }) => status === "pending")
    .reduce((total, { amountCents }) => total + amountCents, 0) as Cents;

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <dt className="text-muted-foreground text-sm">Total pago</dt>
          <dd className="font-semibold text-2xl tabular-nums">
            {formatCurrency(paidTotal)}
          </dd>
        </div>
        <div className="rounded-xl border p-4">
          <dt className="text-muted-foreground text-sm">Em aberto</dt>
          <dd className="font-semibold text-2xl text-warning tabular-nums">
            {formatCurrency(pendingTotal)}
          </dd>
        </div>
      </dl>
      <ul className="divide-y rounded-xl border px-4">
        {payments.map((payment) => (
          <li key={payment.id} className="flex items-center gap-4 py-3.5">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium">
                Sessão de {formatDate(payment.sessionStartsAt)}
              </span>
              <span className="text-muted-foreground text-xs">
                {payment.method
                  ? PAYMENT_METHOD_LABELS[payment.method]
                  : "Aguardando pagamento"}
                {payment.receiptNumber &&
                  ` · Recibo nº ${payment.receiptNumber}`}
              </span>
            </div>
            <PaymentStatusBadge status={payment.status} />
            <span className="w-24 shrink-0 text-right font-semibold tabular-nums">
              {formatCurrency(payment.amountCents)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
