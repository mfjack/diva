import type { AuthError } from "@supabase/supabase-js";
import {
  type ActionFailure,
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";

const AUTH_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  over_request_rate_limit:
    "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
};

const GENERIC_ERROR_MESSAGE = "Algo deu errado. Tente novamente em instantes.";

export const INVALID_FORM_MESSAGE = "Confira os campos e tente novamente.";

export const UNAUTHORIZED_MESSAGE = "Sua sessão expirou. Entre novamente.";

export function getAuthErrorMessage(error: Pick<AuthError, "code">): string {
  return (
    (error.code && AUTH_ERROR_MESSAGES[error.code]) ?? GENERIC_ERROR_MESSAGE
  );
}

export function authFailure(error: Pick<AuthError, "code">): ActionFailure {
  return actionFailure(getAuthErrorMessage(error));
}

export function toAuthResult(
  error: Pick<AuthError, "code"> | null,
): ActionResult {
  return error ? authFailure(error) : actionSuccess();
}
