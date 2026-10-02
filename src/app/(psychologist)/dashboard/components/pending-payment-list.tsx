import { EmptyListMessage } from "@/components/feedback/empty-list-message";
import { StatusBadge } from "@/components/status-badge";
import { getDaysSinceSession, isOverdue } from "@/features/payments/overdue";
import type { Payment } from "@/features/payments/types";
import { formatCurrency, formatDate } from "@/lib/format";

type PendingPaymentListProps = {
  payments: Payment[];
};

export function PendingPaymentList({ payments }: PendingPaymentListProps) {
  if (payments.length === 0) {
    return <EmptyListMessage message="Nenhum pagamento pendente." />;
  }

  return (
    <ul className="divide-y rounded-xl border px-4">
      {payments.map((payment) => {
        const daysSinceSession = getDaysSinceSession(payment);
        return (
          <li key={payment.id} className="flex items-center gap-4 py-3.5">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">
                {payment.patientName}
              </span>
              <span className="text-muted-foreground text-sm">
                Sessão de {formatDate(payment.sessionStartsAt)}
              </span>
            </div>
            {isOverdue(payment) && (
              <StatusBadge tone="destructive">
                {daysSinceSession} dias
              </StatusBadge>
            )}
            <span className="w-24 shrink-0 text-right font-semibold tabular-nums">
              {formatCurrency(payment.amountCents)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
