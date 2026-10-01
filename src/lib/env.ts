import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const ENCRYPTION_KEY_LENGTH = 44;

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CLINICAL_RECORDS_ENCRYPTION_KEY: z.string().length(ENCRYPTION_KEY_LENGTH),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    CLINICAL_RECORDS_ENCRYPTION_KEY:
      process.env.CLINICAL_RECORDS_ENCRYPTION_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
});
