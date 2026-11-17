import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { requestPasswordReset } from "../actions";
import type { ForgotPasswordInput } from "../schemas";

export function getRequestPasswordResetMutationKey() {
  return ["auth", "request-password-reset"] as const;
}

export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationKey: getRequestPasswordResetMutationKey(),
    mutationFn: async (input: ForgotPasswordInput) =>
      unwrapActionResult(await requestPasswordReset(input)),
  });
}
