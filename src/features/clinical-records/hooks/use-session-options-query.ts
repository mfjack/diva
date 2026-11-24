import { useQuery } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { listSessionOptions } from "../actions";

export function getSessionOptionsQueryKey(patientId: string) {
  return ["clinical-records", "session-options", patientId] as const;
}

export function useSessionOptionsQuery(patientId: string | undefined) {
  return useQuery({
    queryKey: getSessionOptionsQueryKey(patientId ?? ""),
    queryFn: async () =>
      patientId ? unwrapActionResult(await listSessionOptions(patientId)) : [],
    enabled: Boolean(patientId),
  });
}
