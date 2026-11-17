import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { previewSessionPlan } from "../actions";
import type { SessionPlanSchemaInput } from "../schemas";

export function getSessionPlanQueryKey(input: SessionPlanSchemaInput | null) {
  return ["appointments", "session-plan", input] as const;
}

export function useSessionPlanQuery(input: SessionPlanSchemaInput | null) {
  return useQuery({
    queryKey: getSessionPlanQueryKey(input),
    queryFn: async () =>
      input ? unwrapActionResult(await previewSessionPlan(input)) : [],
    enabled: input !== null,
    placeholderData: keepPreviousData,
  });
}
