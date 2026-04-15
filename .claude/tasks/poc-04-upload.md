# [04] Upload — Formulário de publicação e upload de PDF

> ClickUp: https://app.clickup.com/t/86agq8z1h
> Status: pendentes · Priority: high · Depends on: [02] DB Schema, [03] Auth

## Contexto

Fluxo de publicação de roteiro: wizard multi-etapas com metadados + upload direto cliente → Supabase Storage + persistência via tRPC.

**Upload DEVE ser client-side** — endpoints server-side na Vercel têm timeout de 10s, insuficiente para PDFs.

**Arquivos a criar:**
- `server/api/scripts.ts` — router tRPC
- `app/publicar/page.tsx` — wizard de publicação (rota protegida, 4 etapas)
- `app/roteiros/[id]/page.tsx` — página pública do roteiro (Server Component)
- `app/roteiros/[id]/script-page-client.tsx` — Client Component com metadados

**Arquivos a atualizar:**
- `server/api/root.ts` — registrar `scriptsRouter`

**Regras:** `.agents/rules/supabase.md`, `.agents/rules/nextjs.md`, `.agents/rules/typescript.md`

---

## Referência de design (Figma)

| Tela | Node ID | Etapa |
|------|---------|-------|
| Fluxo upload / Informações Básicas | `115:1008` | Etapa 1 — título, logline, sinopse |
| Fluxo upload / Arquivos | `115:1075` | Etapa 2 — upload PDF + áudio (opcional) |
| Fluxo upload / Categorização | `125:1430` | Etapa 3 — gênero, classificação etária |
| Fluxo upload / Revisão | `128:1691` | Etapa 4 — revisar e publicar |
| Modal/Roteiro | `51:718` | Página pública do roteiro (ver [05]) |

**Componentes Figma a usar:**

| Componente | Node ID | Uso |
|------------|---------|-----|
| `Progress` | `115:1296` | Indicador das 4 etapas no topo |
| `DragZone` | `100:1303` | Upload de PDF (variant `file`) e áudio (variant `audio`) |
| `Input` | `3:66` | Campos de texto (título, logline, sinopse) |
| `Input (extended)` | `100:622` | Input de tagline / descrição longa |
| `Tag` | `13:95` | Gênero (drama, thriller, comédia…) e classificação |
| `Checkbox` | `48:1107` | Seleção de gênero na etapa de categorização |
| `Button` | `13:84` | Navegação entre etapas (Continuar / Voltar / Publicar) |

**Tokens de design:**

| Elemento | Tailwind class |
|----------|---------------|
| Fundo da página | `bg-base` |
| Container do wizard | `max-w-2xl mx-auto px-5 py-12` |
| Card de etapa | `bg-surface border border-subtle rounded-sm p-8` |
| Label de campo | `text-secondary font-mono text-label-mono-caps uppercase tracking-wider text-xs` |
| Input field | `bg-elevated border-subtle` |
| Botão continuar | `bg-brand-accent text-primary` (variant `default`) |
| Botão voltar | variant `ghost` |
| Botão publicar (etapa 4) | `bg-brand-accent text-primary` — destaque visual máximo |
| Tag de gênero selecionada | `bg-brand-accent/10 border-brand-accent text-brand-accent` |
| Progress step ativo | `bg-brand-accent` |
| Progress step completo | `bg-brand-accent/40` |
| Dropzone idle | `border-dashed border-subtle bg-elevated` |
| Dropzone hover/drag | `border-brand-accent bg-brand-accent/5` |

**Layout:**
- Wizard com `max-w-2xl` (672px) centralizado
- Progress indicator no topo: 4 passos numerados
- Gap entre campos: `gap-6` (24px)
- Padding do card: `p-8` (32px)
- Ações no rodapé do card: botões "Voltar" + "Continuar" alinhados à direita

---

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
  storagePath: z.string().min(1),
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
      cursor: z.string().uuid().optional(),
    }))
    .query(async ({ input }) => {
      const rows = await db.query.scripts.findMany({
        where: (s, { eq }) => eq(s.status, 'published'),
        orderBy: (s, { desc }) => [desc(s.publishedAt)],
        limit: input.limit + 1,
        with: { author: { columns: { id: true, name: true } } },
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
            or(ilike(s.title, `%${input.query}%`)),
            input.genre ? eq(s.genre, input.genre) : undefined,
          ),
        limit: 20,
        with: { author: { columns: { id: true, name: true } } },
      })
    }),
})
```

> Adicionar relações ao schema Drizzle em `server/db/schema.ts` para `scripts.with.author` e `scripts.with.scriptFiles`.

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

### 3. Criar wizard de publicação (app/publicar/page.tsx)

O wizard tem **4 etapas**. Implementar como Client Component com estado de etapa local.

```typescript
'use client'
// Estado de etapa: 1 = Informações Básicas, 2 = Arquivos, 3 = Categorização, 4 = Revisão
```

**Etapa 1 — Informações Básicas (ref: 115:1008):**
- Campos: `title` (obrigatório), `logline` (max 300 chars), `synopsis` (textarea, max 2000 chars)
- Usar `Input` com label em DM Mono uppercase

**Etapa 2 — Arquivos (ref: 115:1075):**
- `DragZone` variant `file` para PDF (bucket `scripts`, max 50MB, application/pdf)
- `DragZone` variant `audio` para áudio opcional (bucket `audio`, max 100MB)
- Validação client-side antes do upload:
  ```typescript
  const MAX_PDF = 50 * 1024 * 1024
  function validatePDF(file: File): string | null {
    if (file.type !== 'application/pdf') return 'Apenas arquivos PDF são aceitos'
    if (file.size > MAX_PDF) return 'O arquivo deve ter no máximo 50MB'
    return null
  }
  ```
- Upload via `supabase.storage.from('scripts').upload(path, file)`

**Etapa 3 — Categorização (ref: 125:1430):**
- Gênero: seleção visual com `Tag` ou `Checkbox` para cada gênero (drama, thriller, comédia, ficção científica, terror, romance, documentário, animação, outro)
- Classificação etária: RadioBox para livre/10/12/14/16/18

**Etapa 4 — Revisão (ref: 128:1691):**
- Resumo de todos os campos preenchidos
- Preview do nome do arquivo PDF
- Botão "Publicar" com destaque `bg-brand-accent`
- Ao confirmar: `trpc.scripts.create.mutate({ ...formData, storagePath, authorId })` → `router.push('/roteiros/${id}')`

**Indicador de progresso (Progress component, ref: 115:1296):**
```typescript
// No topo do wizard — 4 etapas numeradas
<div className="flex items-center gap-2 mb-8">
  {[1, 2, 3, 4].map((step) => (
    <div key={step} className={cn(
      'h-1 flex-1 rounded-full transition-colors',
      step < currentStep ? 'bg-brand-accent/40' :
      step === currentStep ? 'bg-brand-accent' :
      'bg-border-subtle'
    )} />
  ))}
</div>
```

### 4. Criar página do roteiro (app/roteiros/[id]/page.tsx)

Server Component com prefetch tRPC:

```typescript
import { trpc, HydrateClient } from '@/trpc/server'
import ScriptPageClient from './script-page-client'

export default async function ScriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  void trpc.scripts.getById.prefetch({ id })

  return (
    <HydrateClient>
      <ScriptPageClient scriptId={id} />
    </HydrateClient>
  )
}
```

`app/roteiros/[id]/script-page-client.tsx` (Client Component):
- `useTRPC().scripts.getById.useQuery({ id: scriptId })`
- Layout: metadados à esquerda/topo + `PDFViewer` (da task [05]) + seção de comentários
- Exibir título (`font-display text-heading-2`), logline (`text-secondary`), autor, `Tag` de gênero, StarRating
- Referência visual: `51:718` (Modal/Roteiro)

---

## Validação

```bash
yarn build
yarn lint
```

**Fluxo end-to-end (yarn dev, usuário autenticado):**
- [ ] `/publicar` redireciona para login quando não autenticado
- [ ] Progress indicator avança etapa por etapa
- [ ] Etapa 2: DragZone rejeita arquivo não-PDF com mensagem de erro
- [ ] Etapa 2: DragZone rejeita PDF > 50MB com mensagem de erro
- [ ] Upload bem-sucedido: PDF aparece no bucket `scripts` no painel Supabase
- [ ] Roteiro criado aparece na tabela `scripts` com `author_id` correto
- [ ] Redireciona para `/roteiros/[id]` após publicação
- [ ] `/roteiros/[id]` carrega metadados do roteiro
- [ ] Visual: wizard com card bg-surface, progress bar brand-accent, tokens corretos

## Checklist de aceite

- [ ] `scriptsRouter` com `create`, `getById`, `listRecent`, `listFeatured`, `listByAuthor`, `search`
- [ ] Wizard de 4 etapas com Progress indicator
- [ ] Upload client-side direto para Supabase Storage (sem passar por endpoint server)
- [ ] Validação client-side: tipo PDF + tamanho 50MB
- [ ] DragZone usado para upload (não input file simples)
- [ ] Gênero selecionável com Tag/Checkbox na etapa de categorização
- [ ] Roteiro criado acessível em `/roteiros/[id]`
- [ ] `yarn build` passa sem erros de tipo
