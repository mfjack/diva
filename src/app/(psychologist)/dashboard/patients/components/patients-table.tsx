"use client";

import Link from "next/link";
import { type ReactNode, useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createDataTableColumnHelper } from "@/components/data-table/data-table-features";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { useDataTable } from "@/components/data-table/use-data-table";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { PatientStatusBadge } from "@/features/patients/components/patient-status-badge";
import { PATIENT_STATUS_LABELS } from "@/features/patients/labels";
import type { Patient } from "@/features/patients/types";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

const columnHelper = createDataTableColumnHelper<Patient>();

type PatientsTableProps = {
  patients: Patient[];
  emptyState: ReactNode;
  onEditRequest: (patient: Patient) => void;
  onDeleteRequest: (patient: Patient) => void;
};

function getPatientRowId(patient: Patient) {
  return patient.id;
}

export function PatientsTable({
  patients,
  emptyState,
  onEditRequest,
  onDeleteRequest,
}: PatientsTableProps) {
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("fullName", {
          header: "Paciente",
          cell: ({ row }) => (
            <Link
              href={`${ROUTES.psychologist.patients}/${row.original.id}`}
              className="flex min-w-0 flex-col hover:underline"
            >
              <span className="truncate font-medium">
                {row.original.fullName}
              </span>
              {row.original.email && (
                <span className="truncate text-muted-foreground text-xs">
                  {row.original.email}
                </span>
              )}
            </Link>
          ),
        }),
        columnHelper.accessor((patient) => patient.phone ?? "", {
          id: "phone",
          header: "WhatsApp",
          enableSorting: false,
          cell: ({ row }) =>
            row.original.phone ? (
              <WhatsAppLink
                phone={row.original.phone}
                className="text-muted-foreground"
              />
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        }),
        columnHelper.accessor(
          (patient) => PATIENT_STATUS_LABELS[patient.status],
          {
            id: "status",
            header: "Status",
            cell: ({ row }) => (
              <PatientStatusBadge status={row.original.status} />
            ),
          },
        ),
        columnHelper.accessor("sessionPriceCents", {
          header: "Sessão",
          enableGlobalFilter: false,
          cell: ({ getValue }) => (
            <span className="tabular-nums">{formatCurrency(getValue())}</span>
          ),
        }),
        columnHelper.accessor("nextAppointmentAt", {
          header: "Próxima sessão",
          enableGlobalFilter: false,
          cell: ({ getValue }) => {
            const nextAppointmentAt = getValue();
            return (
              <span className="text-muted-foreground">
                {nextAppointmentAt ? formatDateTime(nextAppointmentAt) : "—"}
              </span>
            );
          },
        }),
        columnHelper.accessor("pendingAmountCents", {
          header: "Em aberto",
          enableGlobalFilter: false,
          cell: ({ getValue }) => {
            const pendingAmountCents = getValue();
            return pendingAmountCents > 0 ? (
              <span className="font-medium text-warning tabular-nums">
                {formatCurrency(pendingAmountCents)}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            );
          },
        }),
        columnHelper.display({
          id: "actions",
          header: () => <span className="sr-only">Ações</span>,
          cell: ({ row }) => (
            <DataTableRowActions
              itemLabel={row.original.fullName}
              onEdit={() => onEditRequest(row.original)}
              onDelete={() => onDeleteRequest(row.original)}
            />
          ),
        }),
      ]),
    [onEditRequest, onDeleteRequest],
  );

  const table = useDataTable({
    data: patients,
    columns,
    getRowId: getPatientRowId,
  });

  return (
    <DataTable
      table={table}
      searchPlaceholder="Buscar paciente"
      emptyState={emptyState}
    />
  );
}
