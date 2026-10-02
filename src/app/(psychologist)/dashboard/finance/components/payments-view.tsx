"use client";

import { ReceiptText } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Payment,
  PaymentId,
  PaymentStatus,
} from "@/features/payments/types";
import { PaymentsTable } from "./payments-table";
import { RegisterPaymentDialog } from "./register-payment-dialog";

const STATUS_FILTERS = ["all", "pending", "paid"] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_FILTER_LABELS = {
  all: "Todos",
  pending: "Pendentes",
  paid: "Pagos",
} as const satisfies Record<StatusFilter, string>;

type PaymentsViewProps = {
  initialPayments: Payment[];
  pixKey: string | null;
};

function matchesFilter(status: PaymentStatus, filter: StatusFilter): boolean {
  return filter === "all" || status === filter;
}

export function PaymentsView({ initialPayments, pixKey }: PaymentsViewProps) {
  const [payments, setPayments] = useState(initialPayments);
  const [paymentToRegister, setPaymentToRegister] = useState<Payment | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_FILTERS)
      .withDefault("pending")
      .withOptions({ history: "replace" }),
  );

  const filteredPayments = useMemo(
    () => payments.filter(({ status }) => matchesFilter(status, statusFilter)),
    [payments, statusFilter],
  );

  const handleRegistered = useCallback(
    (paymentId: PaymentId, changes: Partial<Payment>) => {
      setPayments((currentPayments) =>
        currentPayments.map((payment) =>
          payment.id === paymentId ? { ...payment, ...changes } : payment,
        ),
      );
    },
    [],
  );

  return (
    <>
      <PaymentsTable
        payments={filteredPayments}
        pixKey={pixKey}
        onRegisterPayment={setPaymentToRegister}
        toolbarActions={
          <Tabs
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <TabsList className="h-10">
              {STATUS_FILTERS.map((filter) => (
                <TabsTrigger key={filter} value={filter} className="px-4">
                  {STATUS_FILTER_LABELS[filter]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
        emptyState={
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptText aria-hidden />
              </EmptyMedia>
              <EmptyTitle>Nenhum pagamento por aqui</EmptyTitle>
              <EmptyDescription>
                Os pagamentos aparecem quando as sessões são realizadas.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      />
      <RegisterPaymentDialog
        payment={paymentToRegister}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPaymentToRegister(null);
        }}
        onRegistered={handleRegistered}
      />
    </>
  );
}
