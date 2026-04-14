---
paths:
  - "server/db/**"
  - "drizzle/**"
  - "drizzle.config.ts"
---

# Drizzle ORM Rules

## Connection
- Use `postgres` driver with `prepare: false` — required for Supabase transaction pooler:
  ```ts
  const client = postgres(process.env.DATABASE_URL!, { prepare: false })
  export const db = drizzle({ client, schema })
  ```
- `DATABASE_URL`          → Transaction pooler (port 6543) — runtime queries.
- `DATABASE_URL_UNPOOLED` → Session pooler (port 5432) — migrations only.

## Schema (`server/db/schema.ts`)
- Use `pgTable` from `drizzle-orm/pg-core`.
- Primary keys: `uuid("id").primaryKey().defaultRandom()`.
- Timestamps: `timestamp("created_at").defaultNow().notNull()`.
- Always add `notNull()` to required columns explicitly.
- Foreign keys: use Drizzle `.references()` with `onDelete: "cascade"` where appropriate.
- Export each table as a named export — also export `*` as `schema` from `db/index.ts`.

## Migrations
- Generate: `yarn drizzle-kit generate` → creates SQL files in `/drizzle/`.
- Apply:     `yarn drizzle-kit migrate`  → uses `DATABASE_URL_UNPOOLED` from `drizzle.config.ts`.
- Never edit generated SQL files manually.
- Commit the generated SQL files to version control.

## Queries
- Co-locate queries with their feature module (`server/api/routers/<feature>.ts`).
- Use `db.select().from(table).where(eq(table.column, value))` pattern.
- For complex joins, write explicit select with typed columns.
- Avoid N+1 — use joins or `inArray` for batch fetches.
