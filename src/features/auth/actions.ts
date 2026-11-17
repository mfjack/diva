"use server";

import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { env } from "@/lib/env";
import { ROUTES } from "@/lib/routes";
import { getSafeRedirectPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";
import {
  authFailure,
  INVALID_FORM_MESSAGE,
  isRateLimitError,
  toAuthResult,
} from "./errors";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
  type ResetPasswordInput,
  resetPasswordSchema,
  type SignInInput,
  type SignUpInput,
  signInSchema,
  signUpSchema,
} from "./schemas";

export type SignUpResult = { requiresEmailConfirmation: boolean };

export type OAuthRedirect = { url: string };

function buildAuthCallbackUrl(nextPath: string): string {
  const callbackUrl = new URL(ROUTES.authCallback, env.NEXT_PUBLIC_SITE_URL);
  callbackUrl.searchParams.set("next", nextPath);
  return callbackUrl.toString();
}

export async function signIn(input: SignInInput): Promise<ActionResult> {
  const parsedInput = signInSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsedInput.data);
  return toAuthResult(error);
}

export async function signUp(
  input: SignUpInput,
): Promise<ActionResult<SignUpResult>> {
  const parsedInput = signUpSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const { fullName, email, password, nextPath } = parsedInput.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: buildAuthCallbackUrl(getSafeRedirectPath(nextPath)),
    },
  });
  if (error) return authFailure(error);

  return actionSuccess({ requiresEmailConfirmation: !data.session });
}

export async function getGoogleSignInUrl(
  nextPath?: string,
): Promise<ActionResult<OAuthRedirect>> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: buildAuthCallbackUrl(getSafeRedirectPath(nextPath)),
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) return authFailure(error);

  return actionSuccess({ url: data.url });
}

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<ActionResult> {
  const parsedInput = forgotPasswordSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsedInput.data.email,
    { redirectTo: buildAuthCallbackUrl(ROUTES.resetPassword) },
  );

  if (error && isRateLimitError(error)) return authFailure(error);

  return actionSuccess();
}

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<ActionResult> {
  const parsedInput = resetPasswordSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsedInput.data.password,
  });
  return toAuthResult(error);
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  return toAuthResult(error);
}
