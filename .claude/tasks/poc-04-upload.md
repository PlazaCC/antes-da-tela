# [04] Upload — Formulário de publicação e upload de PDF

> ClickUp: https://app.clickup.com/t/86agq8z1h
> Status: pendentes · Priority: high · Depends on: [02] DB Schema, [03] Auth

## Contexto

Fluxo de publicação de roteiro: formulário com metadados + upload direto cliente → Supabase Storage + persistência via tRPC.

**Upload DEVE ser client-side** — endpoints server-side na Vercel têm timeout de 10s, insuficiente para PDFs.

**Arquivos a criar:**
- `server/api/scripts.ts` — router tRPC
- `app/publicar/page.tsx` — formulário de publicação (rota protegida)
- `app/roteiros/[id]/page.tsx` — página pública do roteiro

**Arquivos a atualizar:**
- `server/api/root.ts` — registrar `scriptsRouter`

**Componentes disponíveis em `components/ui/`:**
`DragZone`, `Input`, `Button`, `Tag` (para categoria), `Progress`

**Regras:** `.agents/rules/supabase.md`, `.agents/rules/nextjs.md`, `.agents/rules/typescript.md`

## Passos de execução

### 1. Criar router tRPC de scripts

Criar `server/api/scripts.ts`:

```typescript
import { db } from '@/server/db'
import { scriptFiles, scripts } from '@/server/db/schema'
import { createTRPCRouter, publicProcedure } from '@/trpc/init'
import { eq, desc, ilike, or } from 'drizzle-orm'
import { z } from 'zod'

const GENRES = ['drama', 'thriller', 'comédia', 'ficção científica', 'terror', 'romance', 'documentário', 'animação', 'outro'] as const
const AGE_RATINGS = ['livre', '10', '12', '14', '16', '18'] as const

export const scriptCreateSchema = z.object({
  title: z.string().min(1).max(200),
  logline: z.string().max(300).optional(),
  synopsis: z.string().max(2000).optional(),
  genre: z.enum(GENRES).optional(),
  ageRating: z.enum(AGE_RATINGS).optional(),
  storagePath: z.string().min(1),   // retornado pelo Supabase Storage após upload
  fileSize: z.number().int().positive().optional(),
  pageCount: z.number().int().positive().optional(),
  bannerPath: z.string().optional(),
  authorId: z.string().uuid(),
})

export const scriptsRouter = createTRPCRouter({
  create: publicProcedure
    .input(scriptCreateSchema)
    .mutation(async ({ input }) => {
      const { storagePath, fileSize, pageCount, authorId, ...scriptData } = input

      const [script] = await db
        .insert(scripts)
        .values({ ...scriptData, authorId, publishedAt: new Date() })
        .returning()

      await db.insert(scriptFiles).values({
        scriptId: script.id,
        storagePath,
        fileSize,
        pageCount,
      })

      return script
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const script = await db.query.scripts.findFirst({
        where: (s, { eq }) => eq(s.id, input.id),
        with: {
          scriptFiles: true,
          author: { columns: { id: true, name: true, image: true } },
        },
      })
      return script ?? null
    }),

  listRecent: publicProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(50).default(12),
      cursor: z.string().uuid().optional(), // last script id for cursor pagination
    }))
    .query(async ({ input }) => {
      const rows = await db.query.scripts.findMany({
        where: (s, { eq, and, lt }) =>
          and(
            eq(s.status, 'published'),
            input.cursor ? lt(s.createdAt, db.select(/* subquery */) as any) : undefined,
          ),
        orderBy: (s, { desc }) => [desc(s.publishedAt)],
        limit: input.limit + 1,
        with: {
          author: { columns: { id: true, name: true } },
        },
      })

      const hasMore = rows.length > input.limit
      return { items: rows.slice(0, input.limit), hasMore }
    }),

  listFeatured: publicProcedure.query(async () => {
    return db.query.scripts.findMany({
      where: (s, { eq, and }) => and(eq(s.status, 'published'), eq(s.isFeatured, true)),
      orderBy: (s, { desc }) => [desc(s.publishedAt)],
      limit: 6,
      with: { author: { columns: { id: true, name: true } } },
    })
  }),

  listByAuthor: publicProcedure
    .input(z.object({ authorId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db.query.scripts.findMany({
        where: (s, { eq, and }) => and(eq(s.authorId, input.authorId), eq(s.status, 'published')),
        orderBy: (s, { desc }) => [desc(s.publishedAt)],
        with: { author: { columns: { id: true, name: true } } },
      })
    }),

  search: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(100),
      genre: z.enum(GENRES).optional(),
    }))
    .query(async ({ input }) => {
      return db.query.scripts.findMany({
        where: (s, { eq, and }) =>
          and(
            eq(s.status, 'published'),
            or(
              ilike(s.title, `%${input.query}%`),
            ),
            input.genre ? eq(s.genre, input.genre) : undefined,
          ),
        limit: 20,
        with: { author: { columns: { id: true, name: true } } },
      })
    }),
})
```

> Adicionar relações ao schema Drizzle em `server/db/schema.ts` se necessário: `scripts.with.author`, `scripts.with.scriptFiles`.

### 2. Registrar router em server/api/root.ts

```typescript
import { createTRPCRouter } from '@/trpc/init'
import { usersRouter } from './users'
import { scriptsRouter } from './scripts'

export const appRouter = createTRPCRouter({
  users: usersRouter,
  scripts: scriptsRouter,
})

export type AppRouter = typeof appRouter
```

### 3. Criar página de publicação (app/publicar/page.tsx)

Estrutura do componente (Client Component, `'use client'`):

```typescript
'use client'

import { createBrowserClient } from '@/lib/supabase/client'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { DragZone } from '@/components/ui/drag-zone'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

// 1. Definir schema Zod do formulário (subset do scriptCreateSchema sem storagePath)
// 2. useForm com zodResolver
// 3. Estado local: uploadProgress (0-100), isUploading
// 4. onSubmit:
//    a. Validar PDF (tipo, tamanho <= 50MB) antes de qualquer chamada
//    b. supabase.storage.from('scripts').upload(path, file, { onUploadProgress })
//    c. Após upload: trpc.scripts.create.mutate({ ...formData, storagePath: data.path, authorId: user.id })
//    d. router.push(`/roteiros/${script.id}`)
```

**Validação de arquivo (client-side):**

```typescript
const MAX_SIZE = 50 * 1024 * 1024 // 50MB

function validatePDF(file: File): string | null {
  if (file.type !== 'application/pdf') return 'Apenas arquivos PDF são aceitos'
  if (file.size > MAX_SIZE) return 'O arquivo deve ter no máximo 50MB'
  return null
}
```

**Upload com progresso:**

```typescript
const supabase = createBrowserClient()

async function uploadPDF(file: File, userId: string) {
  const path = `${userId}/${Date.now()}-${file.name.replace(/\s/g, '-')}`
  const { data, error } = await supabase.storage
    .from('scripts')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
  if (error) throw error
  return data.path
}
```

> Supabase JS client v2 não expõe `onUploadProgress` nativamente — usar `XMLHttpRequest` customizado ou `fetch` com `ReadableStream` para progresso real. Para POC, exibir spinner até finalizar.

### 4. Criar página do roteiro (app/roteiros/[id]/page.tsx)

Server Component com prefetch tRPC:

```typescript
import { trpc, HydrateClient } from '@/trpc/server'
import ScriptPageClient from './script-page-client'

export default async function ScriptPage({ params }: { params: { id: string } }) {
  void trpc.scripts.getById.prefetch({ id: params.id })

  return (
    <HydrateClient>
      <ScriptPageClient scriptId={params.id} />
    </HydrateClient>
  )
}
```

`app/roteiros/[id]/script-page-client.tsx` (Client Component):
- `useTRPC().scripts.getById.useQuery({ id: scriptId })`
- Layout: metadados à esquerda/topo + `PDFViewer` (da task [05]) + seção de comentários
- Exibir título, logline, sinopse, autor, genre tag, StarRating

## Validação

```bash
yarn build
yarn lint
```

**Fluxo end-to-end (yarn dev, usuário autenticado):**
- [ ] `/publicar` redireciona para login quando não autenticado
- [ ] Formulário rejeita upload de arquivo não-PDF com mensagem de erro
- [ ] Formulário rejeita PDF > 50MB com mensagem de erro
- [ ] Upload bem-sucedido: PDF aparece no bucket `scripts` no painel Supabase
- [ ] Roteiro criado aparece na tabela `scripts` com `author_id` correto
- [ ] Redireciona para `/roteiros/[id]` após publicação
- [ ] `/roteiros/[id]` carrega os metadados do roteiro

## Checklist de aceite

- [ ] `scriptsRouter` com `create`, `getById`, `listRecent`, `listFeatured`, `listByAuthor`, `search`
- [ ] Upload client-side direto para Supabase Storage (sem passar por endpoint server)
- [ ] Validação client-side: tipo PDF + tamanho 50MB
- [ ] Roteiro criado acessível em `/roteiros/[id]`
- [ ] `yarn build` passa sem erros de tipo
