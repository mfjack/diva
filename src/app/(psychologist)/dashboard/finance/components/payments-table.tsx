"use client";

import { CircleCheck, Download, MessageCircle } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { createDataTableColumnHelper } from "@/components/data-table/data-table-features";
import { DataTableRowActionButton } from "@/components/data-table/data-table-row-action-button";
import { useDataTable } from "@/components/data-table/use-data-table";
import { StatusBadge } from "@/components/status-badge";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { UndoPaymentButton } from "@/features/payments/components/undo-payment-button";
import { PAYMENT_METHOD_LABELS } from "@/features/payments/labels";
import {
  formatOverdueLabel,
  getDaysOverdue,
  isOverdue,
} from "@/features/payments/overdue";
import type { Payment } from "@/features/payments/types";
import { formatCurrency, formatDate } from "@/lib/format";

const columnHelper = createDataTableColumnHelper<Payment>();

type PaymentsTableProps = {
  payments: Payment[];
  toolbarActions: ReactNode;
  emptyState: ReactNode;
  onRegisterPayment: (payment: Payment) => void;
  onChargePayment: (payment: Payment) => void;
};

function getPaymentRowId(payment: Payment) {
  return payment.id;
}

export function PaymentsTable({
  payments,
  toolbarActions,
  emptyState,
  onRegisterPayment,
  onChargePayment,
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
                  {formatOverdueLabel(getDaysOverdue(row.original))}
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

            if (payment.status === "pending") {
              return (
                <div className="flex justify-end gap-2">
                  {payment.patientPhone && isOverdue(payment) && (
                    <DataTableRowActionButton
                      label="Cobrar no WhatsApp"
                      accessibleLabel={`Cobrar ${payment.patientName} no WhatsApp`}
                      icon={MessageCircle}
                      onClick={() => onChargePayment(payment)}
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
              <div className="flex justify-end gap-2">
                {payment.status === "paid" && (
                  <UndoPaymentButton payment={payment} />
                )}
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
    [onRegisterPayment, onChargePayment],
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
