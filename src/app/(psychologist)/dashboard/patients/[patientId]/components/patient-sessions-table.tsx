"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FilePlus2, FileText } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createDataTableColumnHelper } from "@/components/data-table/data-table-features";
import { useDataTable } from "@/components/data-table/use-data-table";
import { AppointmentModalityLabel } from "@/features/appointments/components/appointment-modality-label";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import { APPOINTMENT_STATUS_LABELS } from "@/features/appointments/labels";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { RegisterPaymentButton } from "@/features/payments/components/register-payment-button";
import { UndoPaymentButton } from "@/features/payments/components/undo-payment-button";
import { PAYMENT_METHOD_LABELS } from "@/features/payments/labels";
import { isOverdue } from "@/features/payments/overdue";
import type { Payment } from "@/features/payments/types";
import { formatDateKey } from "@/lib/dates";
import {
  formatCurrency,
  formatDate,
  formatTime,
  toAppTimeZone,
} from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  getSessionPaymentFilter,
  SESSION_PAYMENT_FILTER_LABELS,
  type SessionHistoryEntry,
} from "../session-history";

const RECORD_LINK_CLASS_NAME =
  "inline-flex items-center gap-1.5 whitespace-nowrap text-primary underline-offset-4 hover:underline";

const EMPTY_CELL = <span className="text-muted-foreground">—</span>;

const columnHelper = createDataTableColumnHelper<SessionHistoryEntry>();

type PatientSessionsTableProps = {
  entries: SessionHistoryEntry[];
  emptyState: ReactNode;
  toolbarActions: ReactNode;
  className?: string;
};

function getEntryRowId(entry: SessionHistoryEntry) {
  return entry.appointment.id;
}

function describePayment(payment: Payment): string {
  if (payment.method) return PAYMENT_METHOD_LABELS[payment.method];
  return payment.status === "pending"
    ? `Vence em ${formatDateKey(payment.dueDate)}`
    : "Sem cobrança";
}

function describePaymentFilter(entry: SessionHistoryEntry): string {
  const paymentFilter = getSessionPaymentFilter(entry.payment);
  if (!entry.payment || !paymentFilter) return "";
  return `${SESSION_PAYMENT_FILTER_LABELS[paymentFilter]} ${describePayment(entry.payment)}`;
}

function SessionCell({ appointment }: SessionHistoryEntry) {
  const isCancelled = appointment.status === "cancelled";

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span
        className={cn(
          "font-medium tabular-nums",
          isCancelled && "text-muted-foreground",
        )}
      >
        {formatDate(appointment.startsAt)}
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground text-sm tabular-nums">
        <span className="first-letter:uppercase">
          {format(toAppTimeZone(appointment.startsAt), "EEEE", {
            locale: ptBR,
          })}
        </span>
        · {formatTime(appointment.startsAt)} – {formatTime(appointment.endsAt)}
        <AppointmentModalityLabel
          modality={appointment.modality}
          isTextHidden
        />
      </span>
      {appointment.cancellation?.reason && (
        <span className="max-w-64 truncate text-muted-foreground text-xs">
          {appointment.cancellation.reason}
        </span>
      )}
    </div>
  );
}

function PaymentCell({ payment }: SessionHistoryEntry) {
  if (!payment) return EMPTY_CELL;

  return (
    <div className="flex flex-col items-end gap-1 md:items-start">
      <PaymentStatusBadge
        status={payment.status}
        isOverdue={isOverdue(payment)}
      />
      <span className="text-muted-foreground text-xs">
        {describePayment(payment)}
      </span>
    </div>
  );
}

function RecordCell({ appointment, record }: SessionHistoryEntry) {
  if (record) {
    return (
      <Link
        href={`${ROUTES.psychologist.records}/${record.id}`}
        className={RECORD_LINK_CLASS_NAME}
      >
        <FileText aria-hidden className="size-3.5" />
        Ver
      </Link>
    );
  }
  if (appointment.status !== "completed") return EMPTY_CELL;
  return (
    <Link
      href={`${ROUTES.psychologist.records}/new?appointmentId=${appointment.id}`}
      className={RECORD_LINK_CLASS_NAME}
    >
      <FilePlus2 aria-hidden className="size-3.5" />
      Registrar
    </Link>
  );
}

function PaymentActionsCell({ payment }: SessionHistoryEntry) {
  if (payment?.status === "pending") {
    return (
      <div className="flex justify-end">
        <RegisterPaymentButton target={payment} />
      </div>
    );
  }
  if (payment?.status === "paid") {
    return (
      <div className="flex justify-end">
        <UndoPaymentButton payment={payment} />
      </div>
    );
  }
  return null;
}

export function PatientSessionsTable({
  entries,
  emptyState,
  toolbarActions,
  className,
}: PatientSessionsTableProps) {
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor((entry) => entry.appointment.startsAt, {
          id: "session",
          header: "Sessão",
          enableGlobalFilter: false,
          cell: ({ row }) => <SessionCell {...row.original} />,
        }),
        columnHelper.accessor(
          (entry) => APPOINTMENT_STATUS_LABELS[entry.appointment.status],
          {
            id: "status",
            header: "Status",
            cell: ({ row }) => (
              <AppointmentStatusBadge
                status={row.original.appointment.status}
              />
            ),
          },
        ),
        columnHelper.accessor(describePaymentFilter, {
          id: "payment",
          header: "Pagamento",
          cell: ({ row }) => <PaymentCell {...row.original} />,
        }),
        columnHelper.accessor((entry) => entry.payment?.amountCents ?? 0, {
          id: "amount",
          header: "Valor",
          enableGlobalFilter: false,
          cell: ({ row }) =>
            row.original.payment ? (
              <span className="font-medium tabular-nums">
                {formatCurrency(row.original.payment.amountCents)}
              </span>
            ) : (
              EMPTY_CELL
            ),
        }),
        columnHelper.display({
          id: "record",
          header: "Anotação",
          cell: ({ row }) => <RecordCell {...row.original} />,
        }),
        columnHelper.display({
          id: "actions",
          header: () => <span className="sr-only">Ações</span>,
          cell: ({ row }) => <PaymentActionsCell {...row.original} />,
        }),
      ]),
    [],
  );

  const table = useDataTable({
    data: entries,
    columns,
    getRowId: getEntryRowId,
  });

  return (
    <DataTable
      className={className}
      table={table}
      searchPlaceholder="Buscar por status ou forma de pagamento"
      emptyState={emptyState}
      toolbarActions={toolbarActions}
    />
  );
}
