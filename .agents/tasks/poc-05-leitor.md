# [05] Leitor — PDF viewer com comentários ancorados por página

> ClickUp: https://app.clickup.com/t/86agq8yv2
> Status: pendentes · Priority: urgent · Depends on: [02] DB Schema, [04] Upload

## Contexto

Feature central da POC. Leitor PDF com `pdfjs-dist` + sidebar de comentários filtrada pela página atual.

**Arquivos a criar:**

- `components/pdf-viewer/pdf-viewer.tsx` — componente principal (Client Component, dynamic import)
- `components/pdf-viewer/pdf-viewer-store.ts` — Zustand store
- `components/pdf-viewer/comments-sidebar.tsx` — sidebar de comentários
- `server/api/comments.ts` — router tRPC

**Arquivos a atualizar:**

- `app/scripts/[id]/script-page-client.tsx` — integrar PDFViewer
- `server/api/root.ts` — registrar `commentsRouter`

**Regras:** `.agents/rules/nextjs.md` (dynamic imports), `.agents/rules/typescript.md`

## Next.js — Boas práticas (Leitor / PDF)

- O viewer deve ser um Client Component importado dinamicamente com `next/dynamic({ ssr: false })` para evitar bundling do `pdfjs-dist` no servidor.
- Configure o worker do `pdfjs-dist` via `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()` para evitar problemas de build/worker path.
- Evite usar `pdfjs-dist` em Server Components; todo acesso ao canvas e APIs do navegador deve ocorrer em efeitos (`useEffect`) em Client Components.
- Use uma store leve (Zustand) para compartilhar `currentPage`, `zoom` e estado de carregamento entre viewer e sidebar; mantenha a store no diretório do componente (`components/pdf-viewer`).
- Forneça `loading`/`fallback` via `dynamic` loading component e `Suspense` para boa UX durante renderização do PDF.
- Forneça `loading`/`fallback` via `dynamic` loading component e `Suspense` para boa UX durante renderização do PDF.

## Supabase — Boas práticas (PDF Viewer)

- Configure o bucket `scripts` com CORS permitindo `GET`/`HEAD` de `http://localhost:3000` e do domínio de produção para que `pdfjs-dist` possa carregar os PDFs diretamente.
- Prefira servir PDFs de um bucket `public` para o viewer; se precisar de privacidade, gere signed URLs server-side via um `route.ts` que usa o `SERVICE_ROLE` (mantido apenas no servidor).
- Garanta `Content-Type: application/pdf` no upload e defina `Cache-Control` apropriado para beneficiar o CDN/edge caching (s-maxage/stale-while-revalidate).
- Use `supabase.storage.from('scripts').getPublicUrl(path)` para URLs públicas ou um server endpoint que retorna a signed URL para arquivos privados.
- Busque apenas metadados (pageCount, storagePath) no Server Component e hidrate o cliente; evite transferir o arquivo PDF pelo servidor.

## Referência de design (Figma)

| Tela       | Node ID   | Descrição               |
| ---------- | --------- | ----------------------- |
| PDF Reader | `51:1007` | Tela completa do leitor |

**Componentes Figma a usar:**

| Componente       | Node ID   | Uso                                                           |
| ---------------- | --------- | ------------------------------------------------------------- |
| `ZoomController` | `50:1836` | Controles de zoom (+ / −)                                     |
| `PageController` | `50:1837` | Navegação de páginas (◀ página N/total ▶)                     |
| `Comment`        | `13:136`  | Item de comentário na sidebar (variants: root, simple, reply) |
| `ReactionBar`    | `13:132`  | Barra de reações nos comentários                              |
| `Avatar`         | `38:115`  | Avatar do autor do comentário                                 |

**Layout (da spec do design system):**

```
Desktop 1280px:
┌──────────────────────────────────────────┬─────────────────┐
│  PDF Canvas (880px)                      │  Sidebar (400px) │
│  - Renderizado em <canvas>               │  - Lista de       │
│  - ZoomController sticky no topo         │    comentários    │
│  - PageController sticky no topo         │  - Formulário     │
└──────────────────────────────────────────┴─────────────────┘

Mobile (375px–768px):
- PDF acima (100% largura)
- Sidebar abaixo (100% largura, colapsável)
```

**Tokens de design:**

| Elemento                     | Tailwind class                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| Fundo do leitor              | `bg-base`                                                                               |
| Canvas do PDF                | `rounded-sm border border-subtle shadow-elevation-1`                                    |
| Sidebar                      | `bg-surface border-l border-subtle`                                                     |
| Header da sidebar "Página N" | `font-mono text-label-mono-caps text-secondary uppercase tracking-wider text-xs`        |
| Textarea de comentário       | `bg-elevated border-subtle rounded-sm resize-none focus:ring-1 focus:ring-brand-accent` |
| Botão "Comentar"             | `bg-brand-accent text-primary` (variant `default`, size `sm`)                           |
| Comentário existente         | `bg-elevated rounded-sm p-3 border border-subtle`                                       |
| Autor do comentário          | `text-primary text-body-small font-medium`                                              |
| Data do comentário           | `text-muted font-mono text-label-mono-small`                                            |
| ZoomController               | `bg-elevated border border-subtle rounded-sm px-3 py-1.5`                               |
| PageController               | `bg-elevated border border-subtle rounded-sm flex items-center gap-2`                   |
| Sticky bar do viewer         | `sticky top-0 z-10 bg-base/90 backdrop-blur-sm py-2 border-b border-subtle`             |

---

## Passos de execução

### 1. Criar Zustand store do viewer

Criar `components/pdf-viewer/pdf-viewer-store.ts`:

```typescript
import { create } from 'zustand'

interface PDFViewerState {
  currentPage: number
  totalPages: number
  zoom: number
  isLoading: boolean
  setCurrentPage: (page: number) => void
  setTotalPages: (total: number) => void
  setZoom: (zoom: number) => void
  setLoading: (loading: boolean) => void
}

export const usePDFViewerStore = create<PDFViewerState>((set) => ({
  currentPage: 1,
  totalPages: 0,
  zoom: 1.0,
  isLoading: false,
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setZoom: (zoom) => set({ zoom }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
```

### 2. Criar componente PDFViewer

Criar `components/pdf-viewer/pdf-viewer.tsx` (Client Component):

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { usePDFViewerStore } from './pdf-viewer-store'
import { cn } from '@/lib/utils'

// pdfjs-dist importado dinamicamente — o componente pai usa next/dynamic com ssr: false

interface PDFViewerProps {
  url: string // URL pública do PDF no Supabase Storage
}

export function PDFViewerInner({ url }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<unknown>(null)
  const { currentPage, totalPages, zoom, setTotalPages, setLoading, setCurrentPage } = usePDFViewerStore()

  useEffect(() => {
    async function loadPDF() {
      setLoading(true)
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString()

      const pdf = await pdfjsLib.getDocument(url).promise
      setTotalPages(pdf.numPages)
      setLoading(false)
      await renderPage(pdf, currentPage)
    }

    loadPDF().catch(console.error)
  }, [url])

  useEffect(() => {
    if (!canvasRef.current) return
    renderPageById(currentPage)
  }, [currentPage, zoom])

  async function renderPageById(pageNum: number) {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString()
    const pdf = await pdfjsLib.getDocument(url).promise
    await renderPage(pdf, pageNum)
  }

  async function renderPage(pdf: unknown, pageNum: number) {
    if (!canvasRef.current) return
    if (renderTaskRef.current) {
      (renderTaskRef.current as { cancel: () => void }).cancel()
    }
    const page = await (pdf as { getPage: (n: number) => Promise<unknown> }).getPage(pageNum)
    const viewport = (page as { getViewport: (opts: { scale: number }) => { width: number; height: number } }).getViewport({ scale: zoom })
    const canvas = canvasRef.current
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext('2d')!
    const renderTask = (page as { render: (opts: unknown) => { promise: Promise<void>; cancel: () => void } }).render({ canvasContext: context, viewport })
    renderTaskRef.current = renderTask
    await renderTask.promise
  }

  const goToPrev = () => currentPage > 1 && setCurrentPage(currentPage - 1)
  const goToNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1)

  return (
    <div className="flex flex-col gap-3">
      {/* PageController + ZoomController (ref: 50:1837, 50:1836) */}
      <div className="sticky top-0 z-10 bg-base/90 backdrop-blur-sm py-2 border-b border-subtle flex items-center gap-3">
        {/* PageController */}
        <div className="bg-elevated border border-subtle rounded-sm flex items-center gap-2 px-3 py-1.5">
          <button
            onClick={goToPrev}
            disabled={currentPage <= 1}
            className="text-secondary hover:text-primary disabled:opacity-30 text-sm"
          >
            ←
          </button>
          <span className="font-mono text-label-mono-default text-secondary">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={goToNext}
            disabled={currentPage >= totalPages}
            className="text-secondary hover:text-primary disabled:opacity-30 text-sm"
          >
            →
          </button>
        </div>
        {/* ZoomController */}
        <div className="bg-elevated border border-subtle rounded-sm flex items-center gap-1 px-2 py-1.5">
          <button
            onClick={() => usePDFViewerStore.getState().setZoom(Math.max(0.5, zoom - 0.2))}
            className="text-secondary hover:text-primary w-6 h-6 flex items-center justify-center text-sm"
          >
            −
          </button>
          <span className="font-mono text-label-mono-small text-muted w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => usePDFViewerStore.getState().setZoom(zoom + 0.2)}
            className="text-secondary hover:text-primary w-6 h-6 flex items-center justify-center text-sm"
          >
            +
          </button>
        </div>
      </div>

      {/* Canvas de renderização */}
      <canvas
        ref={canvasRef}
        className="max-w-full rounded-sm border border-subtle shadow-elevation-1"
      />
    </div>
  )
}
```

**Wrapper com dynamic import** (arquivo: `components/pdf-viewer/index.ts`):

```typescript
import dynamic from 'next/dynamic'

export const PDFViewer = dynamic(
  () => import('./pdf-viewer').then((m) => m.PDFViewerInner),
  {
    ssr: false,
    loading: () => <div className="animate-pulse h-[600px] rounded-sm bg-elevated" />,
  },
)
```

### 3. Criar sidebar de comentários

Criar `components/pdf-viewer/comments-sidebar.tsx` (Client Component):

```typescript
'use client'

import { usePDFViewerStore } from './pdf-viewer-store'
import { useTRPC } from '@/trpc/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CommentsSidebarProps {
  scriptId: string
  currentUserId?: string
}

export function CommentsSidebar({ scriptId, currentUserId }: CommentsSidebarProps) {
  const { currentPage } = usePDFViewerStore()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')

  const { data: comments } = useQuery(
    trpc.comments.list.queryOptions({ scriptId, pageNumber: currentPage })
  )

  const createComment = useMutation({
    ...trpc.comments.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.comments.list.queryOptions({ scriptId, pageNumber: currentPage }))
      setContent('')
    },
  })

  return (
    <aside className="flex flex-col gap-4 w-full lg:w-[400px] shrink-0 bg-surface border-l border-subtle p-5">
      {/* Header — ref: label DM Mono uppercase */}
      <p className="font-mono text-label-mono-caps text-secondary uppercase tracking-wider text-xs">
        Página {currentPage}
      </p>

      {/* Lista de comentários — ref: Comment component (13:136) */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
        {comments?.map((c) => (
          <div key={c.id} className="bg-elevated rounded-sm p-3 border border-subtle flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {/* Avatar (ref: 38:115) — iniciais se sem imagem */}
              <div className="w-6 h-6 rounded-full bg-brand-accent/20 flex items-center justify-center text-xs font-medium text-brand-accent">
                {c.author?.name?.[0] ?? '?'}
              </div>
              <span className="text-primary text-body-small font-medium">{c.author?.name ?? 'Anônimo'}</span>
              <span className="text-muted font-mono text-[10px] ml-auto">
                {new Date(c.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <p className="text-secondary text-body-small">{c.content}</p>
          </div>
        ))}
        {comments?.length === 0 && (
          <p className="text-muted text-body-small">Nenhum comentário nesta página.</p>
        )}
      </div>

      {/* Formulário de comentário */}
      {currentUserId ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!content.trim()) return
            createComment.mutate({ scriptId, pageNumber: currentPage, content: content.trim(), authorId: currentUserId })
          }}
          className="flex flex-col gap-2 border-t border-subtle pt-4"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comentar nesta página..."
            rows={3}
            className="w-full rounded-sm border border-subtle bg-elevated p-3 text-body-small text-primary resize-none focus:outline-none focus:ring-1 focus:ring-brand-accent placeholder:text-muted"
          />
          <Button type="submit" size="sm" disabled={createComment.isPending}>
            {createComment.isPending ? 'Enviando...' : 'Comentar'}
          </Button>
        </form>
      ) : (
        <p className="text-muted text-body-small border-t border-subtle pt-4">
          <a href="/auth/login" className="text-brand-accent underline underline-offset-4">Faça login</a> para comentar.
        </p>
      )}
    </aside>
  )
}
```

### 4. Criar router tRPC de comentários

Criar `server/api/comments.ts`:

```typescript
import { db } from '@/server/db'
import { comments } from '@/server/db/schema'
import { createTRPCRouter, publicProcedure } from '@/trpc/init'
import { eq, and, isNull } from 'drizzle-orm'
import { z } from 'zod'

export const commentsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        scriptId: z.string().uuid(),
        pageNumber: z.number().int().min(1),
      }),
    )
    .query(async ({ input }) => {
      return db.query.comments.findMany({
        where: (c, { eq, and, isNull }) =>
          and(eq(c.scriptId, input.scriptId), eq(c.pageNumber, input.pageNumber), isNull(c.deletedAt)),
        orderBy: (c, { asc }) => [asc(c.createdAt)],
        with: { author: { columns: { id: true, name: true, image: true } } },
      })
    }),

  create: publicProcedure
    .input(
      z.object({
        scriptId: z.string().uuid(),
        pageNumber: z.number().int().min(1),
        content: z.string().min(1).max(1000),
        authorId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const [comment] = await db.insert(comments).values(input).returning()
      return comment
    }),

  delete: publicProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        authorId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(comments)
        .set({ deletedAt: new Date() })
        .where(and(eq(comments.id, input.commentId), eq(comments.authorId, input.authorId)))
    }),
})
```

### 5. Registrar router

```typescript
// server/api/root.ts
import { commentsRouter } from './comments'

export const appRouter = createTRPCRouter({
  users: usersRouter,
  scripts: scriptsRouter,
  comments: commentsRouter,
})
```

### 6. Integrar em script-page-client.tsx

```typescript
// app/scripts/[id]/script-page-client.tsx
import { PDFViewer } from '@/components/pdf-viewer'
import { CommentsSidebar } from '@/components/pdf-viewer/comments-sidebar'

// Layout desktop: 880px PDF + 400px sidebar
<div className="flex flex-col lg:flex-row gap-0 min-h-screen">
  <div className="flex-1 min-w-0 p-5">
    {pdfUrl && <PDFViewer url={pdfUrl} />}
  </div>
  <CommentsSidebar scriptId={scriptId} currentUserId={user?.id} />
</div>
```

---

## Validação

```bash
yarn build
yarn lint
```

**Fluxo end-to-end (yarn dev):**

- [ ] PDF abre e renderiza na rota `/scripts/[id]`
- [ ] PageController (◀/▶) navega entre páginas — comentários na sidebar atualizam automaticamente
- [ ] ZoomController (+/−) muda o tamanho do PDF
- [ ] Usuário autenticado adiciona comentário — aparece sem reload
- [ ] Usuário não autenticado vê comentários mas sidebar mostra CTA de login
- [ ] `yarn build` sem erros de SSR (pdfjs é client-only via dynamic import)
- [ ] Sem erros de CORS no console do browser ao carregar o PDF
- [ ] Layout desktop: PDF ~880px, sidebar ~400px
- [ ] Layout mobile: PDF empilhado acima da sidebar

## Checklist de aceite

- [x] `PDFViewer` carregado com `next/dynamic, ssr: false`
- [x] Zustand store controla página atual compartilhada entre viewer e sidebar
- [x] `commentsRouter` com `list`, `create`, `delete`
- [x] Comentários filtrados por `pageNumber` da página visível
- [x] Soft delete (`deleted_at`) nos comentários
- [x] ZoomController e PageController usam tokens do design system (bg-elevated, border-subtle, font-mono)
- [x] Avatar do comentário com inicial do nome + bg-brand-accent/20
- [x] Performance aceitável em roteiros de até 120 páginas (PDF cacheado em ref, sem re-fetch em troca de página)
- [x] `yarn build` limpo
