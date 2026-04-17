# poc-02-db-schema — Archived

**Original title:** [DB] - Modelagem Drizzle e migrations

## What was done
Full Drizzle schema implemented in `server/db/schema.ts` with all required tables: `users` (+ bio), `scripts`, `script_files`, `audio_files`, `comments` (soft delete via `deleted_at`), and `ratings` (unique index on `script_id, user_id`, score check constraint). RLS policies added for all tables. Inferred TypeScript types exported (`User`, `Script`, `ScriptFile`, `AudioFile`, `Comment`, `Rating`). Drizzle migrations generated in `drizzle/` (4 SQL files + storage buckets migration). Storage buckets SQL created at `drizzle/0004_storage_buckets_public.sql`.

## Relevant paths
- `server/db/schema.ts`
- `drizzle/0000_cuddly_phantom_reporter.sql`
- `drizzle/0001_free_gladiator.sql`
- `drizzle/0002_hot_landau.sql`
- `drizzle/0003_absurd_speed.sql`
- `drizzle/0004_storage_buckets_public.sql`
