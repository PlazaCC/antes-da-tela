---
name: new-drizzle-table
description: Creates a new Drizzle ORM table schema and generates the migration. Use when adding a new data entity or database table.
argument-hint: "[table-name] e.g. scripts, comments, tags"
allowed-tools: Read, Write, Bash
---

Create a new Drizzle ORM table for: **$ARGUMENTS**

## Steps

1. **Add the table definition** to `server/db/schema.ts`:

```ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const $ARGUMENTS = pgTable("$ARGUMENTS", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Add columns here — example:
  // title:     text("title").notNull(),
  // userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type $ARGUMENTSInsert = typeof $ARGUMENTS.$inferInsert;
export type $ARGUMENTSSelect = typeof $ARGUMENTS.$inferSelect;
```

2. **Re-export the table** by verifying `server/db/index.ts` imports `* as schema` from `./schema`.

3. **Generate the migration**:
```bash
yarn drizzle-kit generate
```

4. **Apply the migration**:
```bash
yarn drizzle-kit migrate
```

5. **Verify** the table appears in Supabase dashboard → Table Editor.

## Rules
- Use `uuid().primaryKey().defaultRandom()` for all primary keys.
- Foreign keys must use `.references(() => targetTable.id, { onDelete: "cascade" })`.
- Export `Insert` and `Select` inferred types — use them in tRPC router input/output.
- `DATABASE_URL_UNPOOLED` must be set for migrations (session pooler, port 5432).
- Never edit generated files in `/drizzle/` manually.
