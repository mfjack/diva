import "server-only";

import { z } from "zod";

export const AUTH_MODES = ["supabase", "mock"] as const;

export type AuthMode = (typeof AUTH_MODES)[number];

export function parseAuthMode(
  value: string | undefined,
  nodeEnv: string | undefined,
): AuthMode {
  const authMode = z.enum(AUTH_MODES).default("supabase").parse(value);
  if (authMode === "mock" && nodeEnv === "production") {
    throw new Error("AUTH_MODE=mock não pode ser usado em produção.");
  }
  return authMode;
}

export const authMode = parseAuthMode(
  process.env.AUTH_MODE,
  process.env.NODE_ENV,
);

export const isMockAuth = authMode === "mock";
