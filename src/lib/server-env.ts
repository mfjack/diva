import "server-only";

import { z } from "zod";

const ENCRYPTION_KEY_LENGTH = 44;
const CRON_SECRET_MIN_LENGTH = 32;

const serverEnvSchema = z.object({
  CLINICAL_RECORDS_ENCRYPTION_KEY: z.string().length(ENCRYPTION_KEY_LENGTH),
  CRON_SECRET: z.string().min(CRON_SECRET_MIN_LENGTH).optional(),
});

export const serverEnv = serverEnvSchema.parse({
  CLINICAL_RECORDS_ENCRYPTION_KEY: process.env.CLINICAL_RECORDS_ENCRYPTION_KEY,
  CRON_SECRET: process.env.CRON_SECRET || undefined,
});
