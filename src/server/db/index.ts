import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

type DatabaseGlobal = {
  databaseClient?: ReturnType<typeof postgres>;
};

const databaseGlobal = globalThis as DatabaseGlobal;

const databaseClient =
  databaseGlobal.databaseClient ??
  postgres(env.DATABASE_URL, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  databaseGlobal.databaseClient = databaseClient;
}

export const db = drizzle(databaseClient, { schema });

export type Database = typeof db;
