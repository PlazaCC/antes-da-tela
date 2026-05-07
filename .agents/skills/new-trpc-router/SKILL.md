---
name: new-trpc-router
description: Creates a new tRPC router for a feature and wires it into appRouter. Use when adding a new API domain, feature, or data entity that needs server procedures.
argument-hint: "[feature-name] e.g. scripts, comments, users"
allowed-tools: Read, Write, Grep
---

Create a new tRPC v11 router for the feature: **$ARGUMENTS**

## Steps

1. **Create the router file** at `server/api/routers/$ARGUMENTS.ts`:

```ts
import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { z } from "zod";
import { db } from "@/server/db";

export const $ARGUMENTSRouter = createTRPCRouter({
  // Example — replace with real procedures:
  list: publicProcedure.query(async () => {
    // return await db.select().from($ARGUMENTSTable);
    return [];
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      // return await db.select().from($ARGUMENTSTable).where(eq($ARGUMENTSTable.id, input.id));
      return null;
    }),

  create: publicProcedure
    .input(z.object({ /* define fields */ }))
    .mutation(async ({ input }) => {
      // return await db.insert($ARGUMENTSTable).values(input).returning();
      return null;
    }),
});
```

2. **Register the router** in `server/api/root.ts`:

```ts
import { $ARGUMENTSRouter } from "./routers/$ARGUMENTS";

export const appRouter = createTRPCRouter({
  // existing routers...
  $ARGUMENTS: $ARGUMENTSRouter,
});
```

3. **Verify** by searching for the route in `server/api/root.ts` and confirming it compiles.

## Rules
- Use `publicProcedure` for unauthenticated routes.
- For protected routes, add a Supabase auth check: `const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new TRPCError({ code: "UNAUTHORIZED" })`.
- Always validate inputs with `z.object({...})` — never use raw strings or `any`.
- Keep database queries co-located in the router file unless they become large (then extract to `server/db/queries/$ARGUMENTS.ts`).
