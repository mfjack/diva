"use client";

import type { RowData } from "@tanstack/react-table";
import type { RefObject } from "react";
import { LoadMoreTrigger } from "@/components/feedback/load-more-trigger";
import { type DataTableInstance, loadMoreRows } from "./use-data-table";

type DataTableLoadMoreProps<TData extends RowData> = {
  table: DataTableInstance<TData>;
  loadedRowCount: number;
  scrollContainerRef?: RefObject<HTMLElement | null>;
};

export function DataTableLoadMore<TData extends RowData>({
  table,
  loadedRowCount,
  scrollContainerRef,
}: DataTableLoadMoreProps<TData>) {
  return (
    <LoadMoreTrigger
      canLoadMore={table.getCanNextPage()}
      loadedCount={loadedRowCount}
      onLoadMore={() => loadMoreRows(table)}
      scrollContainerRef={scrollContainerRef}
    />
  );
}
