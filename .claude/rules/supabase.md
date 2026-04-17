# Supabase Rules

## CLI-first for all database operations

**Always prefer the Supabase CLI over the MCP server for any operation that writes to the database.**

The Supabase MCP server is configured in read-only mode for this project — `execute_sql` and `apply_migration` will fail with "read-only transaction" errors on any DML/DDL. Use the CLI instead:

```bash
# Run any SQL against the linked remote project
npx --yes supabase@latest db query --linked "<SQL here>"

# Apply a SQL file
npx --yes supabase@latest db query --linked --file ./path/to/file.sql
```

The MCP server is useful for **reads only**:
- `execute_sql` → SELECT queries, inspecting schema, checking RLS policies
- `get_project_url` → retrieve the project URL
- `list_tables`, `list_migrations` → discovery

For **writes** (UPDATE, INSERT, DDL, migrations), always use the CLI.

---

## Auth patterns

- Use `createServerClient` from `@supabase/ssr` in Server Components and API routes.
- Use `createBrowserClient` in Client Components.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for all server auth clients (tRPC context, callback, middleware).
- `SUPABASE_SERVICE_ROLE_KEY` only for privileged server operations that bypass RLS — never in auth flows or client code.

## Storage

- All buckets (`scripts`, `audio`, `avatars`) must be `public: true` — files are served via `getPublicUrl()`.
- **Always resolve PDF/media URLs server-side** in Server Components using `ctx.supabase.storage.from(bucket).getPublicUrl(path)` and pass the URL as a prop to Client Components. Never call `getPublicUrl` client-side.
- Uploads must be **client-side only** — Vercel server functions time out at 10 s, which is insufficient for files up to 50 MB.
- Upload path convention: `{userId}/{timestamp}_{sanitized_filename}` — enforced by the INSERT policy (`storage.foldername(name)[1] = auth.uid()`).

## RLS

- RLS is enabled on all user-facing tables.
- `storage.objects` INSERT/UPDATE/DELETE policies restrict modifications to the owning user.
- Public reads on buckets require `public = true` on `storage.buckets` — no extra SELECT policy needed for `anon` when the bucket is public.

## Select discipline — RSC boundary

**Never use `.select('*')` in queries whose result crosses the RSC → Client Component boundary.**

Every column selected is serialized into the HTML response. Internal columns (`author_id`, `status`, `created_at`, `banner_path`, …) are never needed by the client and bloat the payload.

```ts
// ❌ Sends all ~13 columns
.select('*, script_files(*), author:users!author_id(id, name, image)')

// ✅ Only what the client renders
.select(
  'id, title, logline, synopsis, genre, age_rating,' +
  ' script_files(id, storage_path, page_count, file_size),' +
  ' author:users!author_id(id, name, image)'
)
```

`*` is acceptable inside **server-only mutations** where the returned data never leaves the server function.

## TanStack Query mutations — capture volatile state at submit time

When a mutation's `onSuccess` needs to reference state that changes (e.g. `currentPage`), pass the callback **inline on `.mutate()`**, not in `mutationOptions`. This captures the value at submit time, not at resolution time.

```ts
// ❌ currentPage may have changed by the time onSuccess fires
const createComment = useMutation({ ...trpc.comments.create.mutationOptions(), onSuccess: () => {
  void queryClient.invalidateQueries(trpc.comments.list.queryOptions({ pageNumber: currentPage }))
}})

// ✅ capture at submit
const createComment = useMutation(trpc.comments.create.mutationOptions())
// in onSubmit:
const page = currentPage
createComment.mutate(data, {
  onSuccess: () => void queryClient.invalidateQueries(trpc.comments.list.queryOptions({ pageNumber: page }))
})
```

## Migrations

- **User-defined tables** → Drizzle schema in `server/db/schema.ts` + `yarn drizzle:generate` + `yarn drizzle:migrate`.
- **Supabase-specific config** (storage buckets, RLS policies, extensions) → raw SQL files in `drizzle/` named `XXXX_description.sql`, applied via `npx supabase@latest db query --linked --file`.
- Never edit generated migration files retroactively; create a new migration instead.
