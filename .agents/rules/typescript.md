---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript & tRPC Rules

## TypeScript
- Always use strict TypeScript — no `any`, no non-null assertions (`!`) without a comment explaining why.
- Export types from the module where they are defined — import with `type` keyword when it is type-only.
- Prefer `type` over `interface` unless declaration merging is needed.
- Use `satisfies` operator to validate shapes while keeping inferred types narrow.

## tRPC v11
- Router file: `server/api/root.ts` — add new sub-routers here via `appRouter`.
- Each feature router lives in `server/api/routers/<feature>.ts`.
- Procedures use `publicProcedure` (unauthenticated) — create `protectedProcedure` with Supabase session check when auth is needed.
- Always validate inputs with Zod in `.input(schema)`.
- `createTRPCContext` signature: `async (opts: { headers: Headers }) => ({ headers: opts.headers })`.
- Use `Awaited<ReturnType<typeof createTRPCContext>>` as the generic — **not** `typeof createTRPCContext`.
- For server components: `import { trpc, HydrateClient } from "@/trpc/server"`.
- For client components: `import { useTRPC } from "@/trpc/client"`.
- Never call tRPC from a Server Action — use a direct server function or a tRPC caller instead.

## Zod
- Reuse validation schemas between tRPC `.input()` and React Hook Form `zodResolver`.
- Keep shared schemas in `lib/validations/` (e.g., `lib/validations/script.ts`).
- Prefer `.min(1, "Campo obrigatório")` for required strings.
