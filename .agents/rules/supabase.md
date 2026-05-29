---
paths:
  - 'lib/supabase/**'
  - 'middleware.ts'
  - 'app/**/*.ts'
  - 'app/**/*.tsx'
  - 'server/**/*.ts'
---

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

## Safety and Error Handling (STRICT)

**If any database operation, migration, or connection attempt fails, STOP immediately.**

1.  **Do NOT attempt alternative workarounds** (e.g., creating scratch scripts to bypass the CLI, trying to run SQL via RPC if not already established, or manual schema edits).
2.  **Do NOT "guess" fixes** for migration history mismatches or connection errors.
3.  **Mandatory Manual Verification:** Immediately report the error to the user and ask for manual verification or intervention.
4.  **No Loops:** If a command fails twice with the same error, do not retry a third time.

Common failure points that require immediate stop:

- `yarn db:migrate` or `yarn supabase:push` failures.
- "migration history does not match local files" errors.
- Connection timeouts or "project not linked" errors.
- Docker-related failures if attempting local development commands.

---

## Client Creation & Auth

- **Server Components / Route Handlers / Server Actions**: use `createServerClient` from `@supabase/ssr`.

  ```ts
  import { createServerClient } from '@supabase/ssr'
  import { cookies } from 'next/headers'

  export const createClient = async () =>
    createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      cookies: { getAll: () => (await cookies()).getAll() },
    })
  ```

- **Client Components**: use `createBrowserClient` from `@supabase/ssr`.

  ```ts
  import { createBrowserClient } from '@supabase/ssr'

  export const createClient = () =>
    createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
  ```

## Session Handling

- The session is refreshed automatically in `middleware.ts` — never skip or disable the middleware.
- Always call `supabase.auth.getUser()` (not `getSession()`) in server-side code — `getSession()` is not validated server-side.
- For protected tRPC procedures, verify auth inside the context or a middleware:
  ```ts
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  ```
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for all server auth clients (tRPC context, callback, middleware).
- `SUPABASE_SERVICE_ROLE_KEY` only for privileged server operations that bypass RLS — never in auth flows or client code.
- Never expose `SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY` in client-side code or `NEXT_PUBLIC_*` env vars.

## Storage

- All buckets (`scripts`, `audio`, `avatars`) must be `public: true` — files are served via `getPublicUrl()`.
- **Always resolve PDF/media URLs server-side** in Server Components using `ctx.supabase.storage.from(bucket).getPublicUrl(path)` and pass the URL as a prop to Client Components. Never call `getPublicUrl` client-side.
- Uploads must be **client-side only** — Vercel server functions time out at 10 s, which is insufficient for files up to 50 MB.
- Upload path convention: `{userId}/{timestamp}_{sanitized_filename}` — enforced by the INSERT policy (`storage.foldername(name)[1] = auth.uid()`).
- PDFs and audio files go to Supabase Storage; serve heavy files through Cloudflare CDN proxy.
- Storage bucket policies should enforce authentication before upload.

## RLS

- RLS is enabled on all user-facing tables.
- `storage.objects` INSERT/UPDATE/DELETE policies restrict modifications to the owning user.
- Public reads on buckets require `public = true` on `storage.buckets` — no extra SELECT policy needed for `anon` when the bucket is public.
- Use Row Level Security (RLS) policies in Supabase for data access control.
- Validate ownership in tRPC procedures even when RLS is enabled — defense in depth.

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
const createComment = useMutation({
  ...trpc.comments.create.mutationOptions(),
  onSuccess: () => {
    void queryClient.invalidateQueries(trpc.comments.list.queryOptions({ pageNumber: currentPage }))
  },
})

// ✅ capture at submit
const createComment = useMutation(trpc.comments.create.mutationOptions())
// in onSubmit:
const page = currentPage
createComment.mutate(data, {
  onSuccess: () => void queryClient.invalidateQueries(trpc.comments.list.queryOptions({ pageNumber: page })),
})
```

## Realtime

- Use Supabase Realtime channels for live comments via `supabase.channel()`.
- Always clean up subscriptions with `.unsubscribe()` in `useEffect` cleanup.

## Migrations

Scripts: `yarn db:generate` (Drizzle) · `yarn db:migrate` · `yarn supabase:new <name>` · `yarn supabase:push` · `yarn supabase:pull`.
Never bypass the CLI scripts. User-defined tables in `server/db/schema.ts`; Supabase-specific config in `supabase/migrations/`. Never edit migrations retroactively — create a new one.
