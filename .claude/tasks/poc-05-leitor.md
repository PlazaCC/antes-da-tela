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
- `app/roteiros/[id]/script-page-client.tsx` — integrar PDFViewer
- `server/api/root.ts` — registrar `commentsRouter`

**Regras:** `.agents/rules/nextjs.md` (dynamic imports), `.agents/rules/typescript.md`

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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// pdfjs-dist deve ser importado com dynamic para evitar SSR issues
// O componente pai usa next/dynamic com ssr: false

interface PDFViewerProps {
  url: string // URL pública do PDF no Supabase Storage
}

export function PDFViewerInner({ url }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<any>(null)
  const { currentPage, totalPages, zoom, setTotalPages, setLoading, setCurrentPage } = usePDFViewerStore()

  useEffect(() => {
    let pdf: any = null

    async function loadPDF() {
      setLoading(true)
      const pdfjsLib = await import('pdfjs-dist')

      // Worker — usar o bundlado pelo Next.js
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString()

      pdf = await pdfjsLib.getDocument(url).promise
      setTotalPages(pdf.numPages)
      setLoading(false)

      await renderPage(pdf, currentPage)
    }

    loadPDF().catch(console.error)

    return () => { pdf = null }
  }, [url])

  useEffect(() => {
    if (!canvasRef.current) return
    // Re-render quando página ou zoom muda
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

  async function renderPage(pdf: any, pageNum: number) {
    if (!canvasRef.current) return

    // Cancelar render anterior se existir
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
    }

    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: zoom })
    const canvas = canvasRef.current
    canvas.width = viewport.width
    canvas.height = viewport.height

    const context = canvas.getContext('2d')!
    const renderTask = page.render({ canvasContext: context, viewport })
    renderTaskRef.current = renderTask

    await renderTask.promise
  }

  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1)
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1)

  return (
    <div className="flex flex-col gap-3">
      {/* Controles de navegação */}
      <div className="flex items-center gap-2 sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2">
        <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={currentPage <= 1}>
          ←
        </Button>
        <Input
          type="number"
          value={currentPage}
          min={1}
          max={totalPages}
          className="w-16 text-center"
          onChange={(e) => {
            const p = parseInt(e.target.value)
            if (p >= 1 && p <= totalPages) setCurrentPage(p)
          }}
        />
        <span className="text-sm text-muted-foreground">/ {totalPages}</span>
        <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage >= totalPages}>
          →
        </Button>
        <Button variant="outline" size="sm" onClick={() => usePDFViewerStore.getState().setZoom(zoom + 0.2)}>+</Button>
        <Button variant="outline" size="sm" onClick={() => usePDFViewerStore.getState().setZoom(Math.max(0.5, zoom - 0.2))}>−</Button>
      </div>

      {/* Canvas de renderização */}
      <canvas
        ref={canvasRef}
        className="max-w-full rounded border border-border shadow-elevation-1"
      />
    </div>
  )
}
```

**Wrapper com dynamic import** (usado em `script-page-client.tsx`):

```typescript
// components/pdf-viewer/index.ts
import dynamic from 'next/dynamic'

export const PDFViewer = dynamic(
  () => import('./pdf-viewer').then((m) => m.PDFViewerInner),
  {
    ssr: false,
    loading: () => <div className="animate-pulse h-[600px] rounded bg-muted" />,
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
import { Button } from '@/components/ui/button'
import { Comment } from '@/components/ui/comment'

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
    <aside className="flex flex-col gap-4 w-80 shrink-0">
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Página {currentPage}
      </p>

      <div className="flex flex-col gap-3">
        {comments?.map((c) => (
          <Comment key={c.id} author={c.author?.name ?? 'Anônimo'} content={c.content} createdAt={c.createdAt} />
        ))}
        {comments?.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum comentário nesta página.</p>
        )}
      </div>

      {currentUserId ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!content.trim()) return
            createComment.mutate({ scriptId, pageNumber: currentPage, content: content.trim(), authorId: currentUserId })
          }}
          className="flex flex-col gap-2"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comentar nesta página..."
            rows={3}
            className="w-full rounded border border-border bg-surface p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button type="submit" size="sm" disabled={createComment.isPending}>
            {createComment.isPending ? 'Enviando...' : 'Comentar'}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <a href="/auth/login" className="underline">Faça login</a> para comentar.
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
    .input(z.object({
      scriptId: z.string().uuid(),
      pageNumber: z.number().int().min(1),
    }))
    .query(async ({ input }) => {
      return db.query.comments.findMany({
        where: (c, { eq, and, isNull }) =>
          and(
            eq(c.scriptId, input.scriptId),
            eq(c.pageNumber, input.pageNumber),
            isNull(c.deletedAt),
          ),
        orderBy: (c, { asc }) => [asc(c.createdAt)],
        with: { author: { columns: { id: true, name: true, image: true } } },
      })
    }),

  create: publicProcedure
    .input(z.object({
      scriptId: z.string().uuid(),
      pageNumber: z.number().int().min(1),
      content: z.string().min(1).max(1000),
      authorId: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      const [comment] = await db.insert(comments).values(input).returning()
      return comment
    }),

  delete: publicProcedure
    .input(z.object({
      commentId: z.string().uuid(),
      authorId: z.string().uuid(), // validação de ownership no router
    }))
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
// app/roteiros/[id]/script-page-client.tsx
import { PDFViewer } from '@/components/pdf-viewer'
import { CommentsSidebar } from '@/components/pdf-viewer/comments-sidebar'

// No layout:
<div className="flex gap-6">
  <div className="flex-1 min-w-0">
    {pdfUrl && <PDFViewer url={pdfUrl} />}
  </div>
  <CommentsSidebar scriptId={scriptId} currentUserId={user?.id} />
</div>
```

## Validação

```bash
yarn build
yarn lint
```

**Fluxo end-to-end (yarn dev):**
- [ ] PDF abre e renderiza na rota `/roteiros/[id]`
- [ ] Navegar entre páginas atualiza os comentários na sidebar automaticamente
- [ ] Usuário autenticado adiciona comentário — aparece sem reload
- [ ] Usuário não autenticado vê comentários mas sidebar mostra CTA de login
- [ ] `yarn build` não tem erros de SSR (pdfjs é client-only via dynamic import)
- [ ] Sem erros de CORS no console do browser ao carregar o PDF

## Checklist de aceite

- [ ] `PDFViewer` carregado com `next/dynamic, ssr: false`
- [ ] Zustand store controla página atual compartilhada entre viewer e sidebar
- [ ] `commentsRouter` com `list`, `create`, `delete`
- [ ] Comentários filtrados por `pageNumber` da página visível
- [ ] Soft delete (campo `deleted_at`) nos comentários
- [ ] Performance aceitável em roteiros de até 120 páginas
- [ ] `yarn build` limpo
