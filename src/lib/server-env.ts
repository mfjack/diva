import "server-only";

import { z } from "zod";

const ENCRYPTION_KEY_LENGTH = 44;

const serverEnvSchema = z.object({
  CLINICAL_RECORDS_ENCRYPTION_KEY: z.string().length(ENCRYPTION_KEY_LENGTH),
});

export const serverEnv = serverEnvSchema.parse({
  CLINICAL_RECORDS_ENCRYPTION_KEY: process.env.CLINICAL_RECORDS_ENCRYPTION_KEY,
});
