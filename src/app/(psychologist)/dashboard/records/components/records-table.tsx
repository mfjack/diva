"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createDataTableColumnHelper } from "@/components/data-table/data-table-features";
import { useDataTable } from "@/components/data-table/use-data-table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
          header: "Anotação",
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
        columnHelper.accessor((record) => record.sessionStartsAt ?? "", {
          id: "session",
          header: "Sessão",
          enableGlobalFilter: false,
          cell: ({ row }) => (
            <span className="text-muted-foreground">
              {row.original.sessionStartsAt
                ? formatDate(row.original.sessionStartsAt)
                : "—"}
            </span>
          ),
        }),
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
      searchPlaceholder="Buscar por título ou paciente"
      emptyState={
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Nenhuma anotação ainda</EmptyTitle>
            <EmptyDescription>
              Registre as anotações das sessões, ligadas à agenda.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
    />
  );
}
