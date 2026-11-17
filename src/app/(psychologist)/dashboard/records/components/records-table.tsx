"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createDataTableColumnHelper } from "@/components/data-table/data-table-features";
import { useDataTable } from "@/components/data-table/use-data-table";
import { StatusBadge } from "@/components/status-badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CLINICAL_RECORD_KIND_LABELS } from "@/features/clinical-records/labels";
import type { ClinicalRecordSummary } from "@/features/clinical-records/types";
import { formatDate } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

const columnHelper = createDataTableColumnHelper<ClinicalRecordSummary>();

type RecordsTableProps = {
  records: ClinicalRecordSummary[];
};

function getRecordRowId(record: ClinicalRecordSummary) {
  return record.id;
}

export function RecordsTable({ records }: RecordsTableProps) {
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("title", {
          header: "Documento",
          cell: ({ row }) => (
            <Link
              href={`${ROUTES.psychologist.records}/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {row.original.title}
            </Link>
          ),
        }),
        columnHelper.accessor("patientName", {
          header: "Paciente",
        }),
        columnHelper.accessor(
          (record) => CLINICAL_RECORD_KIND_LABELS[record.kind],
          {
            id: "kind",
            header: "Tipo",
            cell: ({ getValue }) => (
              <StatusBadge tone="neutral">{getValue()}</StatusBadge>
            ),
          },
        ),
        columnHelper.accessor("updatedAt", {
          header: "Atualizado em",
          enableGlobalFilter: false,
          cell: ({ getValue }) => (
            <span className="text-muted-foreground">
              {formatDate(getValue())}
            </span>
          ),
        }),
      ]),
    [],
  );

  const table = useDataTable({
    data: records,
    columns,
    getRowId: getRecordRowId,
  });

  return (
    <DataTable
      className="md:flex-1"
      table={table}
      searchPlaceholder="Buscar por título, paciente ou tipo"
      emptyState={
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Nenhum documento ainda</EmptyTitle>
            <EmptyDescription>
              Registre a evolução das sessões ou emita laudos e declarações.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
    />
  );
}
