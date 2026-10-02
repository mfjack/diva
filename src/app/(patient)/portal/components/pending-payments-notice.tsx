import { ArrowRight, Hourglass } from "lucide-react";
import Link from "next/link";
import type { Payment } from "@/features/payments/types";
import { formatCurrency } from "@/lib/format";
import type { Cents } from "@/lib/money";
import { ROUTES } from "@/lib/routes";

type PendingPaymentsNoticeProps = {
  payments: Payment[];
};

export function PendingPaymentsNotice({
  payments,
}: PendingPaymentsNoticeProps) {
  const totalCents = payments.reduce(
    (total, { amountCents }) => total + amountCents,
    0,
  ) as Cents;

  return (
    <Link
      href={ROUTES.patient.payments}
      className="group flex items-center gap-4 rounded-xl border border-warning/40 bg-warning/8 p-4 transition-colors hover:border-warning"
    >
      <Hourglass aria-hidden className="size-5 shrink-0 text-warning" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium">
          {payments.length === 1
            ? "Você tem 1 sessão aguardando pagamento"
            : `Você tem ${payments.length} sessões aguardando pagamento`}
        </span>
        <span className="text-muted-foreground text-sm">
          Total de {formatCurrency(totalCents)}. Pague por Pix em poucos
          segundos.
        </span>
      </div>
      <ArrowRight
        aria-hidden
        className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
