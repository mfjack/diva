import { Skeleton } from "@/components/ui/skeleton";

const PLACEHOLDER_ROWS = 6;

export function RouteLoading() {
  return (
    <div className="flex flex-1 flex-col" role="status" aria-busy>
      <span className="sr-only">Carregando…</span>
      <div className="flex flex-col gap-2 px-4 pt-8 pb-2 md:px-8">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex flex-col gap-3 px-4 pt-6 md:px-8">
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, rowIndex) => (
          <Skeleton
            key={`loading-row-${rowIndex.toString()}`}
            className="h-16 w-full rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}
