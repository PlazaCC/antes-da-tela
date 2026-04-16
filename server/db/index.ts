import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Strip query-string parameters that Supabase's transaction pooler (PgBouncer)
 * does not accept as PostgreSQL startup parameters.
 *
 * The `postgres` npm package forwards URL query params directly as startup
 * params.  PgBouncer rejects any it doesn't recognise — `pgmode` (e.g.
 * `?pgmode=transaction`) is one such param that appears in some Supabase
 * pooler connection strings and causes an immediate "unsupported startup
 * parameter" error.
 */
function sanitizePoolerUrl(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("pgmode");
    return u.toString();
  } catch {
    return url;
  }
}

const client = postgres(sanitizePoolerUrl(process.env.DATABASE_URL!), {
  prepare: false, // required — Supabase transaction pooler does not support prepared statements
});

export const db = drizzle({ client, schema });
