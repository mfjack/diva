import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { acceptTerms } from "../actions";
import type { AcceptTermsInput } from "../schemas";

export function getAcceptTermsMutationKey() {
  return ["auth", "accept-terms"] as const;
}

export function useAcceptTermsMutation() {
  return useMutation({
    mutationKey: getAcceptTermsMutationKey(),
    mutationFn: async (input: AcceptTermsInput) =>
      unwrapActionResult(await acceptTerms(input)),
  });
}
