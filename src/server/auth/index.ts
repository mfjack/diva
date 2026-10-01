import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/lib/env";
import { db } from "@/server/db";
import { accounts, sessions, users, verifications } from "@/server/db/schema";

const SESSION_EXPIRATION_IN_SECONDS = 60 * 60 * 24 * 7;
const SESSION_UPDATE_AGE_IN_SECONDS = 60 * 60 * 24;
const SESSION_COOKIE_CACHE_IN_SECONDS = 60 * 5;
const MINIMUM_PASSWORD_LENGTH = 8;

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: MINIMUM_PASSWORD_LENGTH,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "patient",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    expiresIn: SESSION_EXPIRATION_IN_SECONDS,
    updateAge: SESSION_UPDATE_AGE_IN_SECONDS,
    cookieCache: {
      enabled: true,
      maxAge: SESSION_COOKIE_CACHE_IN_SECONDS,
    },
  },
  rateLimit: {
    enabled: true,
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
