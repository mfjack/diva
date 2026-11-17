"use client";

import { Clock } from "lucide-react";
import { useSyncExternalStore } from "react";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const MINUTE_IN_MS = 60_000;

function subscribeToMinutes(onMinuteChange: () => void): () => void {
  let intervalId: ReturnType<typeof setInterval> | undefined;
  const timeoutId = setTimeout(
    () => {
      onMinuteChange();
      intervalId = setInterval(onMinuteChange, MINUTE_IN_MS);
    },
    MINUTE_IN_MS - (Date.now() % MINUTE_IN_MS),
  );
  return () => {
    clearTimeout(timeoutId);
    clearInterval(intervalId);
  };
}

function getCurrentTime(): string {
  return formatTime(new Date());
}

type LiveClockProps = {
  className?: string;
};

export function LiveClock({ className }: LiveClockProps) {
  const currentTime = useSyncExternalStore(
    subscribeToMinutes,
    getCurrentTime,
    getCurrentTime,
  );

  return (
    <span
      className={cn(
        "flex h-10 items-center gap-3 px-3 font-medium text-sm tabular-nums",
        className,
      )}
    >
      <Clock aria-hidden className="size-4 shrink-0" />
      <span className="sr-only">Agora são </span>
      <time suppressHydrationWarning>{currentTime}</time>
    </span>
  );
}
