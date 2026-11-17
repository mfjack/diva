"use client";

import { ReceiptText } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegisterPaymentDialog } from "@/features/payments/components/register-payment-dialog";
import type { Payment, PaymentStatus } from "@/features/payments/types";
import { PaymentsTable } from "./payments-table";

const STATUS_FILTERS = ["all", "pending", "paid"] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_FILTER_LABELS = {
  all: "Todos",
  pending: "Pendentes",
  paid: "Pagos",
} as const satisfies Record<StatusFilter, string>;

type PaymentsViewProps = {
  payments: Payment[];
  pixKey: string | null;
};

function matchesFilter(status: PaymentStatus, filter: StatusFilter): boolean {
  return filter === "all" || status === filter;
}

function isStatusFilter(value: unknown): value is StatusFilter {
  return STATUS_FILTERS.some((filter) => filter === value);
}

export function PaymentsView({ payments, pixKey }: PaymentsViewProps) {
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

  function handleStatusFilterChange(value: unknown) {
    if (isStatusFilter(value)) setStatusFilter(value);
  }

  function handleRegisterOpenChange(isOpen: boolean) {
    if (!isOpen) setPaymentToRegister(null);
  }

  return (
    <>
      <PaymentsTable
        payments={filteredPayments}
        pixKey={pixKey}
        onRegisterPayment={setPaymentToRegister}
        toolbarActions={
          <Tabs value={statusFilter} onValueChange={handleStatusFilterChange}>
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
        target={paymentToRegister}
        onOpenChange={handleRegisterOpenChange}
      />
    </>
  );
}
