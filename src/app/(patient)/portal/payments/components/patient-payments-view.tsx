"use client";

import { Download, QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyListMessage } from "@/components/feedback/empty-list-message";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { PAYMENT_METHOD_LABELS } from "@/features/payments/labels";
import type { Payment } from "@/features/payments/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { PixPaymentDialog } from "./pix-payment-dialog";

type PatientPaymentsViewProps = {
  payments: Payment[];
  pixKey: string | null;
  psychologistName: string;
};

export function PatientPaymentsView({
  payments,
  pixKey,
  psychologistName,
}: PatientPaymentsViewProps) {
  const [paymentToPay, setPaymentToPay] = useState<Payment | null>(null);
  const pendingPayments = payments.filter(({ status }) => status === "pending");
  const settledPayments = payments.filter(({ status }) => status !== "pending");

  return (
    <>
      <Section title="Em aberto">
        {pendingPayments.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {pendingPayments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-col gap-4 rounded-xl border border-warning/40 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">
                    Sessão de {formatDate(payment.sessionStartsAt)}
                  </span>
                  <span className="font-semibold text-2xl tabular-nums">
                    {formatCurrency(payment.amountCents)}
                  </span>
                </div>
                {pixKey && (
                  <Button
                    className="h-11"
                    onClick={() => setPaymentToPay(payment)}
                  >
                    <QrCode aria-hidden />
                    Pagar com Pix
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyListMessage message="Tudo em dia. Nenhum pagamento pendente." />
        )}
      </Section>

      <Section title="Histórico">
        {settledPayments.length > 0 ? (
          <ul className="divide-y rounded-xl border px-4">
            {settledPayments.map((payment) => (
              <li key={payment.id} className="flex items-center gap-4 py-3.5">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">
                    Sessão de {formatDate(payment.sessionStartsAt)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {payment.paidAt && payment.method
                      ? `Pago em ${formatDate(payment.paidAt)} via ${PAYMENT_METHOD_LABELS[payment.method]}`
                      : "Sem cobrança"}
                  </span>
                </div>
                <PaymentStatusBadge status={payment.status} />
                <span className="hidden w-24 text-right font-medium tabular-nums sm:block">
                  {formatCurrency(payment.amountCents)}
                </span>
                {payment.status === "paid" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Baixar recibo da sessão de ${formatDate(payment.sessionStartsAt)}`}
                    onClick={() =>
                      toast.info("O recibo em PDF entra junto com o backend.")
                    }
                  >
                    <Download aria-hidden />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyListMessage message="Nenhum pagamento no histórico." />
        )}
      </Section>

      {pixKey && (
        <PixPaymentDialog
          payment={paymentToPay}
          pixKey={pixKey}
          psychologistName={psychologistName}
          onOpenChange={(isOpen) => {
            if (!isOpen) setPaymentToPay(null);
          }}
        />
      )}
    </>
  );
}
