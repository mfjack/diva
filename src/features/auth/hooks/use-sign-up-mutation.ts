import { useMutation } from "@tanstack/react-query";
import { unwrapActionResult } from "@/lib/action-result";
import { signUp } from "../actions";
import type { SignUpInput } from "../schemas";

export function getSignUpMutationKey() {
  return ["auth", "sign-up"] as const;
}

export function useSignUpMutation() {
  return useMutation({
    mutationKey: getSignUpMutationKey(),
    mutationFn: async (input: SignUpInput) =>
      unwrapActionResult(await signUp(input)),
  });
}
