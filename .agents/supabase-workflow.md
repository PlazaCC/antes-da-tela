# Supabase + Drizzle Migration Workflow

This file documents the canonical workflow for schema changes, migrations, and applying them to remote Supabase projects. Follow this process to keep local Drizzle migrations and the remote schema in sync.

Principles

- Use Drizzle (`drizzle-kit`) for all schema changes and migration generation.
- Never edit `supabase/migrations/*.sql` directly for authoritative migration history; instead generate a migration via Drizzle and review the SQL.
- Before pushing migrations to remote, run `supabase db advisors` and create a DB dump.

Typical workflow

1. Make schema changes in `server/db/schema.ts` (Drizzle schema definitions).

2. Generate a migration SQL file locally:

```bash
# Generates a new migration SQL file under drizzle/ or migrations/ depending on config
yarn drizzle:generate "add_new_column_to_scripts"
```

3. Review the generated migration SQL. Edit only for small fixes (formatting), do not rework logic unless necessary.

4. Run advisors and create a dump before applying:

```bash
npx --yes supabase db advisors --linked
yarn db:dump
```

5. Apply the migration to the remote (prefer `supabase db push` for single-file migrations or `supabase db query -f` for manual SQL):

```bash
# push local migration state
yarn db:push
# or apply a single file
npx --yes supabase db query --file ./drizzle/migrations/0001_my_migration.sql --linked
```

6. After successful push, commit the migration files and open a PR that includes the schema changes and migration SQL.

CI / Automation

- CI should run `yarn drizzle-kit migrate --check` or equivalent to validate migrations apply cleanly.
- Do not run `supabase db push` in CI against production without manual approval.

Emergency / quick fix

- If a migration must be applied manually, create a `drizzle` migration afterwards to capture the change back into the repo.

Reference

- Drizzle docs: https://orm.drizzle.team
- Supabase CLI docs: https://supabase.com/docs/reference/cli

Security checklist

- Run `supabase db advisors` and follow security recommendations before applying schema changes to production.
- Ensure RLS and policies are added for any table exposed to `anon`/`authenticated` roles.

Agent behavior

- Agents automating this flow must never overwrite `drizzle/` migrations or `server/db/schema.ts` without human approval.
- Agents should create a PR and include the `drizzle` migration + migration SQL in the PR description.
