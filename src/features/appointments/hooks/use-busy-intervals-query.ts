import { useQuery } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { listBusyIntervals } from "../actions";
import type { BusyIntervalsInput } from "../schemas";

export function getBusyIntervalsQueryKey(input: BusyIntervalsInput | null) {
  return ["appointments", "busy-intervals", input] as const;
}

export function useBusyIntervalsQuery(input: BusyIntervalsInput | null) {
  return useQuery({
    queryKey: getBusyIntervalsQueryKey(input),
    queryFn: async () =>
      input ? unwrapActionResult(await listBusyIntervals(input)) : [],
    enabled: input !== null,
  });
}
