"use client";

import type { RowData } from "@tanstack/react-table";
import { type RefObject, useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { type DataTableInstance, loadMoreRows } from "./use-data-table";

const PRELOAD_DISTANCE = "240px";

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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const canLoadMore = table.getCanNextPage();

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !canLoadMore || loadedRowCount === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) loadMoreRows(table);
      },
      {
        root: scrollContainerRef?.current ?? null,
        rootMargin: `0px 0px ${PRELOAD_DISTANCE} 0px`,
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [table, canLoadMore, loadedRowCount, scrollContainerRef]);

  if (!canLoadMore) return null;

  return (
    <div
      ref={sentinelRef}
      className="flex justify-center py-4 text-muted-foreground"
    >
      <Spinner aria-label="Carregando mais itens" />
    </div>
  );
}
