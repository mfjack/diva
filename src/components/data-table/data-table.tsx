"use client";

import type { RowData } from "@tanstack/react-table";
import { type ReactNode, useRef } from "react";
import { SearchInput } from "@/components/search-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DataTableFooter } from "./data-table-footer";
import { DataTableLoadMore } from "./data-table-load-more";
import { DataTableSortableHeader } from "./data-table-sortable-header";
import { type DataTableInstance, resetLoadedRows } from "./use-data-table";

const LOADING_ROW_COUNT = 5;
const ACTIONS_COLUMN_ID = "actions";

type DataTableProps<TData extends RowData> = {
  table: DataTableInstance<TData>;
  searchPlaceholder: string;
  isLoading?: boolean;
  errorMessage?: string;
  emptyState: ReactNode;
  toolbarActions?: ReactNode;
  className?: string;
};

export function DataTable<TData extends RowData>({
  table,
  searchPlaceholder,
  isLoading = false,
  errorMessage,
  emptyState,
  toolbarActions,
  className,
}: DataTableProps<TData>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const columnCount = table.getAllLeafColumns().length;
  const hasData = table.getCoreRowModel().rows.length > 0;
  const headersByColumnId = new Map(
    table
      .getHeaderGroups()
      .flatMap((headerGroup) => headerGroup.headers)
      .map((header) => [header.column.id, header]),
  );

  if (errorMessage) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  if (!isLoading && !hasData) return emptyState;

  return (
    <div className={cn("flex min-h-0 flex-col gap-4", className)}>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <SearchInput
          placeholder={searchPlaceholder}
          value={table.state.globalFilter ?? ""}
          onChange={(value) => {
            table.setGlobalFilter(value);
            resetLoadedRows(table);
            scrollContainerRef.current?.scrollTo({ top: 0 });
          }}
          className="sm:max-w-xs"
        />
        {toolbarActions}
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {isLoading
          ? Array.from({ length: LOADING_ROW_COUNT }, (_, rowIndex) => (
              <Skeleton
                key={`loading-card-${rowIndex.toString()}`}
                className="h-28 rounded-xl"
              />
            ))
          : rows.map((row) => {
              const cells = row.getAllCells();
              const actionsCell = cells.find(
                (cell) => cell.column.id === ACTIONS_COLUMN_ID,
              );
              const [titleCell, ...detailCells] = cells.filter(
                (cell) => cell.column.id !== ACTIONS_COLUMN_ID,
              );

              return (
                <article
                  key={row.id}
                  className="flex flex-col gap-3 rounded-xl border bg-card p-4"
                >
                  {titleCell && (
                    <div className="min-w-0">
                      <table.FlexRender cell={titleCell} />
                    </div>
                  )}
                  {detailCells.length > 0 && (
                    <dl className="flex flex-col gap-1.5 text-sm">
                      {detailCells.map((cell) => {
                        const header = headersByColumnId.get(cell.column.id);
                        return (
                          <div
                            key={cell.id}
                            className="flex items-center justify-between gap-4"
                          >
                            <dt className="shrink-0 text-muted-foreground">
                              {header && <table.FlexRender header={header} />}
                            </dt>
                            <dd className="min-w-0 text-right">
                              <table.FlexRender cell={cell} />
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  )}
                  {actionsCell && (
                    <div className="flex justify-end border-t pt-3">
                      <table.FlexRender cell={actionsCell} />
                    </div>
                  )}
                </article>
              );
            })}
        {!isLoading && rows.length === 0 && (
          <p className="py-8 text-center text-muted-foreground text-sm">
            Nenhum resultado para essa busca.
          </p>
        )}
        <DataTableLoadMore table={table} loadedRowCount={rows.length} />
      </div>

      <div
        ref={scrollContainerRef}
        className="isolate hidden min-h-0 flex-1 overflow-auto rounded-xl border md:block"
      >
        <table data-slot="table" className="w-full caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/60">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-11 px-4">
                    {header.isPlaceholder ? null : (
                      <DataTableSortableHeader header={header}>
                        <table.FlexRender header={header} />
                      </DataTableSortableHeader>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: LOADING_ROW_COUNT }, (_, rowIndex) => (
                  <TableRow key={`loading-${rowIndex.toString()}`}>
                    <TableCell colSpan={columnCount} className="px-4 py-3">
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getAllCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3">
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum resultado para essa busca.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
        <DataTableLoadMore
          table={table}
          loadedRowCount={rows.length}
          scrollContainerRef={scrollContainerRef}
        />
      </div>

      <DataTableFooter table={table} />
    </div>
  );
}
