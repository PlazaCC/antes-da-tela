---
name: new-page
description: Scaffolds a new Next.js App Router page with proper Server Component patterns, Supabase auth check, tRPC prefetch, and metadata. Use when adding a new route or page to the app.
argument-hint: "[route-path] e.g. dashboard, scripts/[id], profile"
allowed-tools: Read, Write, Grep
---

Scaffold a new Next.js App Router page at: **app/$ARGUMENTS/page.tsx**

## Files to create

### 1. `app/$ARGUMENTS/page.tsx` — Server Component page

```tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HydrateClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "$ARGUMENTS | Antes da Tela",
  description: "Descrição da página $ARGUMENTS",
};

export default async function $ARGUMENTSPage() {
  // Auth check — remove if page is public
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  // Prefetch tRPC data — replace with actual procedure
  // await trpc.<router>.<procedure>.prefetch();

  return (
    <HydrateClient>
      <main>
        <h1>$ARGUMENTS</h1>
        {/* Page content */}
      </main>
    </HydrateClient>
  );
}
```

### 2. `app/$ARGUMENTS/loading.tsx` — Skeleton loading state

```tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-muted-foreground">Carregando...</div>
    </div>
  );
}
```

### 3. `app/$ARGUMENTS/error.tsx` — Error boundary (Client Component)

```tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-semibold">Algo deu errado.</h2>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
```

## Rules
- Default is a protected page (auth check + redirect). Remove auth check for public pages.
- Use `HydrateClient` and server-side `trpc` prefetching for data.
- Always set `metadata` with page-specific `title` and `description`.
- `loading.tsx` improves perceived performance — always create it.
