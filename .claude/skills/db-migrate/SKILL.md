---
name: db-migrate
description: Generates and applies a Drizzle migration after schema changes. Use after modifying server/db/schema.ts.
disable-model-invocation: true
allowed-tools: Bash, Read
---

Run Drizzle migration workflow after schema changes.

## Steps

1. **Generate the migration SQL**:
```bash
yarn drizzle-kit generate
```
This will output SQL files in `drizzle/`.

2. **Review** the generated SQL file in `drizzle/` — verify the changes look correct.

3. **Apply the migration** to the database:
```bash
yarn drizzle-kit migrate
```
> Uses `DATABASE_URL_UNPOOLED` from `drizzle.config.ts` (session pooler, port 5432). Make sure it is set in `.env.local`.

4. **Verify** in Supabase dashboard → Table Editor that the table/column changes are reflected.

## Notes
- `DATABASE_URL` (port 6543, transaction pooler) is for runtime queries only.
- `DATABASE_URL_UNPOOLED` (port 5432, session pooler) is required for migrations.
- If migration fails, check the error for constraint violations or type mismatches.
- Commit both code changes AND generated SQL files in `drizzle/` together.
