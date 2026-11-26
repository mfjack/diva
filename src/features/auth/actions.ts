"use server";

import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { env } from "@/lib/env";
import { LEGAL_DOCUMENTS_VERSION } from "@/lib/legal";
import { ROUTES } from "@/lib/routes";
import { getSafeRedirectPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";
import { authFailure, INVALID_FORM_MESSAGE, toAuthResult } from "./errors";
import { type AcceptTermsInput, acceptTermsSchema } from "./schemas";

const ACCEPT_TERMS_FAILED_MESSAGE =
  "Não foi possível registrar o aceite. Tente novamente.";

type OAuthRedirect = { url: string };

function buildAuthCallbackUrl(nextPath: string): string {
  const callbackUrl = new URL(ROUTES.authCallback, env.NEXT_PUBLIC_SITE_URL);
  callbackUrl.searchParams.set("next", nextPath);
  return callbackUrl.toString();
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

export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  return toAuthResult(error);
}

export async function acceptTerms(
  input: AcceptTermsInput,
): Promise<ActionResult> {
  const parsedInput = acceptTermsSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_terms", {
    p_version: LEGAL_DOCUMENTS_VERSION,
  });
  if (error) return actionFailure(ACCEPT_TERMS_FAILED_MESSAGE);
  return actionSuccess();
}
