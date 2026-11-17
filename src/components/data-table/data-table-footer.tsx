import type { RowData } from "@tanstack/react-table";
import type { DataTableInstance } from "./use-data-table";

type DataTableFooterProps<TData extends RowData> = {
  table: DataTableInstance<TData>;
};

function formatItemCount(count: number): string {
  return `${count} ${count === 1 ? "item" : "itens"}`;
}

export function DataTableFooter<TData extends RowData>({
  table,
}: DataTableFooterProps<TData>) {
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const shownRowCount = table.getRowModel().rows.length;

  return (
    <p className="shrink-0 text-muted-foreground text-sm">
      {shownRowCount < filteredRowCount
        ? `Mostrando ${shownRowCount} de ${formatItemCount(filteredRowCount)}`
        : formatItemCount(filteredRowCount)}
    </p>
  );
}
