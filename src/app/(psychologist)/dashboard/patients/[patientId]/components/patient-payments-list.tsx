import { EmptyListMessage } from "@/components/feedback/empty-list-message";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { RegisterPaymentButton } from "@/features/payments/components/register-payment-button";
import { UndoPaymentButton } from "@/features/payments/components/undo-payment-button";
import { PAYMENT_METHOD_LABELS } from "@/features/payments/labels";
import { isOverdue } from "@/features/payments/overdue";
import type { Payment } from "@/features/payments/types";
import { formatDateKey } from "@/lib/dates";
import { formatCurrency, formatDate } from "@/lib/format";

function describePaymentState(payment: Payment): string {
  if (payment.method) return PAYMENT_METHOD_LABELS[payment.method];
  if (payment.status === "pending") {
    return `Vence em ${formatDateKey(payment.dueDate)}`;
  }
  return "Sem cobrança";
}

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
            <span className="text-muted-foreground text-sm">
              {describePaymentState(payment)}
              {payment.receiptNumber && ` · Recibo nº ${payment.receiptNumber}`}
            </span>
          </div>
          {payment.status === "pending" && (
            <RegisterPaymentButton target={payment} />
          )}
          {payment.status === "paid" && <UndoPaymentButton payment={payment} />}
          <PaymentStatusBadge
            status={payment.status}
            isOverdue={isOverdue(payment)}
          />
          <span className="w-24 shrink-0 text-right font-semibold tabular-nums">
            {formatCurrency(payment.amountCents)}
          </span>
        </li>
      ))}
    </ul>
  );
}
