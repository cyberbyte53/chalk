import { fileURLToPath } from "node:url";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { schema } from "./schema";

/** The database, whichever driver is under it (Postgres on the box, PGlite in tests). */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

/** The migrations `drizzle-kit generate` wrote; applied in order, each once. */
export const MIGRATIONS = fileURLToPath(new URL("../drizzle", import.meta.url));

/** Connects to Postgres and brings it up to the latest migration. */
export async function openDb(url: string): Promise<{ db: Db; close: () => Promise<void> }> {
  const client = postgres(url, { max: 10, onnotice: () => {} });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  return { db, close: () => client.end() };
}
