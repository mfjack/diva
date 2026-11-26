"use client";

import { type RefObject, useEffect, useEffectEvent, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";

const PRELOAD_DISTANCE = "240px";

type LoadMoreTriggerProps = {
  canLoadMore: boolean;
  loadedCount: number;
  onLoadMore: () => void;
  scrollContainerRef?: RefObject<HTMLElement | null>;
};

export function LoadMoreTrigger({
  canLoadMore,
  loadedCount,
  onLoadMore,
  scrollContainerRef,
}: LoadMoreTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const handleIntersection = useEffectEvent(onLoadMore);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !canLoadMore || loadedCount === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) handleIntersection();
      },
      {
        root: scrollContainerRef?.current ?? null,
        rootMargin: `0px 0px ${PRELOAD_DISTANCE} 0px`,
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoadMore, loadedCount, scrollContainerRef]);

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
