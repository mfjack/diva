"use client";

import { CircleCheck, Download, MessageCircle } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { createDataTableColumnHelper } from "@/components/data-table/data-table-features";
import { DataTableRowActionButton } from "@/components/data-table/data-table-row-action-button";
import { useDataTable } from "@/components/data-table/use-data-table";
import { StatusBadge } from "@/components/status-badge";
import { getChargeWhatsAppUrl } from "@/features/payments/charge-message";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { PAYMENT_METHOD_LABELS } from "@/features/payments/labels";
import { getDaysSinceSession, isOverdue } from "@/features/payments/overdue";
import type { Payment } from "@/features/payments/types";
import { formatCurrency, formatDate } from "@/lib/format";

const columnHelper = createDataTableColumnHelper<Payment>();

type PaymentsTableProps = {
  payments: Payment[];
  pixKey: string | null;
  toolbarActions: ReactNode;
  emptyState: ReactNode;
  onRegisterPayment: (payment: Payment) => void;
};

function getPaymentRowId(payment: Payment) {
  return payment.id;
}

export function PaymentsTable({
  payments,
  pixKey,
  toolbarActions,
  emptyState,
  onRegisterPayment,
}: PaymentsTableProps) {
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("patientName", {
          header: "Paciente",
          cell: ({ getValue }) => (
            <span className="font-medium">{getValue()}</span>
          ),
        }),
        columnHelper.accessor("sessionStartsAt", {
          header: "Sessão",
          enableGlobalFilter: false,
          cell: ({ row }) => (
            <span className="flex items-center gap-2">
              {formatDate(row.original.sessionStartsAt)}
              {isOverdue(row.original) && (
                <StatusBadge tone="destructive">
                  {getDaysSinceSession(row.original)} dias
                </StatusBadge>
              )}
            </span>
          ),
        }),
        columnHelper.accessor("amountCents", {
          header: "Valor",
          enableGlobalFilter: false,
          cell: ({ getValue }) => (
            <span className="font-medium tabular-nums">
              {formatCurrency(getValue())}
            </span>
          ),
        }),
        columnHelper.accessor("status", {
          header: "Status",
          enableGlobalFilter: false,
          cell: ({ getValue }) => <PaymentStatusBadge status={getValue()} />,
        }),
        columnHelper.accessor((payment) => payment.paidAt ?? "", {
          id: "paidAt",
          header: "Pago em",
          enableGlobalFilter: false,
          cell: ({ row }) => (
            <span className="text-muted-foreground">
              {row.original.paidAt && row.original.method
                ? `${formatDate(row.original.paidAt)} · ${PAYMENT_METHOD_LABELS[row.original.method]}`
                : "—"}
            </span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: () => <span className="sr-only">Ações</span>,
          cell: ({ row }) => {
            const payment = row.original;
            const chargeUrl = getChargeWhatsAppUrl(payment, pixKey);

            if (payment.status === "pending") {
              return (
                <div className="flex justify-end gap-2">
                  {chargeUrl && (
                    <DataTableRowActionButton
                      label="Cobrar no WhatsApp"
                      accessibleLabel={`Cobrar ${payment.patientName} no WhatsApp`}
                      icon={MessageCircle}
                      onClick={() =>
                        window.open(chargeUrl, "_blank", "noopener,noreferrer")
                      }
                    />
                  )}
                  <DataTableRowActionButton
                    label="Registrar pagamento"
                    accessibleLabel={`Registrar pagamento de ${payment.patientName}`}
                    icon={CircleCheck}
                    onClick={() => onRegisterPayment(payment)}
                  />
                </div>
              );
            }

            return (
              <div className="flex justify-end">
                {payment.status === "paid" && (
                  <DataTableRowActionButton
                    label="Baixar recibo"
                    accessibleLabel={`Baixar recibo de ${payment.patientName}`}
                    icon={Download}
                    onClick={() =>
                      toast.info("O recibo em PDF entra junto com o backend.")
                    }
                  />
                )}
              </div>
            );
          },
        }),
      ]),
    [pixKey, onRegisterPayment],
  );

  const table = useDataTable({
    data: payments,
    columns,
    getRowId: getPaymentRowId,
  });

  return (
    <DataTable
      table={table}
      searchPlaceholder="Buscar paciente"
      emptyState={emptyState}
      toolbarActions={toolbarActions}
    />
  );
}
