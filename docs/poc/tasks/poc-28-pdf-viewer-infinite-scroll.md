# poc-28 — PDF Viewer: Infinite Scroll com Comentários por Página

**Scope:** Frontend
**Priority:** P1
**Status:** pending
**Figma:** PDF Reader `51:1007`

---

## O que já está feito ✓

- PDF viewer com pdfjs-dist (canvas rendering, SSR disabled via `next/dynamic`)
- `usePdfjs()` hook para lazy load da lib com worker `/public/pdf.worker.min.mjs`
- `useContainerWidth()` hook com ResizeObserver para largura responsiva (poc-27)
- Zustand store (`pdf-viewer-store.ts`) com `currentPage`, `totalPages`, `zoom`, `isLoading`
- `PdfControls` com prev/next e zoom
- `CommentsSidebar` com input, reactions e mobile Sheet (poc-24)
- `comments.page_number INTEGER` no schema — nenhuma migration necessária
- tRPC `comments.list({ scriptId, pageNumber })` funcional com cache TanStack Query
- Mobile Sheet + FAB implementados (poc-24)

---

## Gaps

### 1. PDF Viewer: renderização multi-canvas com lazy loading por IntersectionObserver

Atualmente `pdf-viewer.tsx` carrega o documento uma vez, guarda `docRef.current` e renderiza um único canvas para `currentPage`. A mudança consiste em:

1. Manter o carregamento do documento no componente pai (`PDFViewerInner`) e expor o `PDFDocumentProxy` via estado/prop.
2. Criar um componente `PageRow` que recebe `docProxy`, `pageNumber`, `containerWidth` e `zoom`, e gerencia seu próprio canvas + renderização.
3. Renderizar `Array.from({ length: totalPages })` de `PageRow`s empilhados verticalmente.
4. Cada `PageRow` usa `IntersectionObserver` (`rootMargin: '800px'`) para decidir se deve montar o canvas — páginas fora do viewport não são renderizadas.

```tsx
// pdf-viewer.tsx — estrutura alvo (componente pai)
export function PDFViewerInner({ url, scriptId, allComments, isAuthenticated }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const containerWidth = useContainerWidth(containerRef)
  const pdfjs = usePdfjs()
  const { zoom, totalPages, setTotalPages, setLoading } = usePDFViewerStore()
  const [docProxy, setDocProxy] = useState<PdfjsLib.PDFDocumentProxy | null>(null)

  // Carrega documento uma única vez
  useEffect(() => {
    if (!pdfjs || !url) return
    setLoading(true)
    pdfjs.getDocument(url).promise.then(doc => {
      setDocProxy(doc)
      setTotalPages(doc.numPages)
      setLoading(false)
    })
    return () => { docProxy?.destroy(); setDocProxy(null) }
  }, [pdfjs, url])

  const commentsByPage = useMemo(() =>
    allComments.reduce<Record<number, CommentWithAuthor[]>>((acc, c) => {
      ;(acc[c.page_number] ??= []).push(c)
      return acc
    }, {}),
  [allComments])

  return (
    <div className="flex flex-col">
      <PdfControls />
      <div ref={containerRef} className="w-full overflow-auto bg-bg-secondary">
        {docProxy && Array.from({ length: totalPages }, (_, i) => (
          <PageRow
            key={i + 1}
            pageNumber={i + 1}
            docProxy={docProxy}
            containerWidth={containerWidth}
            zoom={zoom}
            comments={commentsByPage[i + 1] ?? []}
            scriptId={scriptId}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </div>
  )
}
```

```tsx
// components/pdf-viewer/page-row.tsx
function PageRow({ pageNumber, docProxy, containerWidth, zoom, comments, scriptId, isAuthenticated }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<ReturnType<PdfjsLib.PDFPageProxy['render']> | null>(null)
  const [shouldRender, setShouldRender] = useState(false)

  // Ativa lazy render quando a row entra no viewport (com margem de 800px)
  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setShouldRender(true) },
      { rootMargin: '800px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Renderiza canvas quando shouldRender + deps mudam
  useEffect(() => {
    if (!shouldRender || !canvasRef.current || containerWidth <= 0) return
    let isDisposed = false

    async function render() {
      const page = await docProxy.getPage(pageNumber)
      if (isDisposed) return
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      const baseViewport = page.getViewport({ scale: 1 })
      const scale = (containerWidth * 0.6) / baseViewport.width  // 60% da largura (coluna esquerda do grid)
      const viewport = page.getViewport({ scale: scale * zoom })
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(viewport.width * dpr)
      canvas.height = Math.floor(viewport.height * dpr)
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      renderTaskRef.current?.cancel()
      const task = page.render({ canvasContext: ctx, viewport })
      renderTaskRef.current = task
      try { await task.promise } catch { /* RenderingCancelledException ignorado */ }
    }

    void render()
    return () => {
      isDisposed = true
      renderTaskRef.current?.cancel()
    }
  }, [shouldRender, docProxy, pageNumber, containerWidth, zoom])

  return (
    <div ref={rowRef} className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 py-6 border-b border-border-subtle last:border-b-0">
      <div className="flex justify-center bg-bg-base">
        {shouldRender
          ? <canvas ref={canvasRef} className="block" />
          : <PagePlaceholder containerWidth={containerWidth} />}
      </div>
      <PageComments
        pageNumber={pageNumber}
        scriptId={scriptId}
        comments={comments}
        isAuthenticated={isAuthenticated}
      />
    </div>
  )
}
```

### 2. Zustand store: `currentPage` derivado do scroll (read-only via scroll)

Adicionar um segundo `IntersectionObserver` com `threshold: 0.5` em cada `PageRow` para detectar qual página ocupa mais de 50% do viewport e atualizar `currentPage` no store — usado apenas pelo indicador no toolbar. O setter acionado pelos botões prev/next é removido.

```ts
// pdf-viewer-store.ts — renomear setter para deixar semântica clara
setCurrentPageFromScroll: (page: number) => set({ currentPage: page }),
```

### 3. PdfControls: remover prev/next, manter zoom + indicador de página

```tsx
// Antes
<Button onClick={prevPage}>‹</Button>
<span>{currentPage} / {totalPages}</span>
<Button onClick={nextPage}>›</Button>

// Depois — apenas indicador de leitura + zoom
<span className="text-sm tabular-nums text-text-muted">
  {currentPage} / {totalPages}
</span>
```

### 4. Comentários: endpoint `listAll` + agrupamento client-side

Adicionar `comments.listAll({ scriptId })` que retorna todos os comentários do roteiro de uma vez. Agrupamento por `page_number` é feito client-side com `useMemo`.

```ts
// server/api/comments.ts
listAll: publicProcedure
  .input(z.object({ scriptId: z.string().uuid() }))
  .query(({ ctx, input }) => commentsService.listAll(ctx.supabase, input.scriptId)),
```

```ts
// server/services/comments.service.ts
async listAll(supabase: SupabaseClient, scriptId: string) {
  const { data } = await supabase
    .from('comments')
    .select('id, script_id, page_number, content, created_at, author:users!author_id(id, name, image)')
    .eq('script_id', scriptId)
    .is('deleted_at', null)
    .order('page_number', { ascending: true })
    .order('created_at', { ascending: true })
  return data ?? []
}
```

### 5. PageComments: componente por página

Extrair da `CommentsSidebar` um componente `PageComments` reutilizável:

```tsx
// components/pdf-viewer/page-comments.tsx
interface PageCommentsProps {
  pageNumber: number
  scriptId: string
  comments: CommentWithAuthor[]
  isAuthenticated: boolean
  className?: string
}
```

- Desktop (lg+): coluna direita do grid — lista + input sempre visíveis
- Tablet/Mobile: `<Collapsible>` com trigger `"{N} comentários ▾"` (collapsed por padrão)
- Mutations de create/reaction invalidam a query `comments.listAll` (não mais `comments.list` por página)

### 6. Layout da página do roteiro

Remover o layout sidebar-fixa + canvas fixo. `PdfViewer` recebe `allComments` como prop; o layout do grid (canvas + comentários) vive dentro de `PageRow`.

---

## Mobile & Tablet (Figma é desktop-only — especificação adicional)

**Desktop (≥1024px):**
- `grid grid-cols-[3fr_2fr]` por `PageRow`: canvas esquerda (~60%), comentários direita (~40%)
- Toolbar `sticky top-14` com zoom + indicador de página
- Comentários sempre visíveis ao lado de cada página

**Tablet (768–1023px):**
- `grid grid-cols-1` — canvas full-width
- `PageComments` em `<Collapsible>` abaixo de cada página (collapsed por padrão, trigger "N comentários ▾")

**Mobile (<768px):**
- Canvas full-width
- `PageComments` em `<Collapsible>` abaixo de cada página (collapsed por padrão)
- Touch targets ≥44×44px em todos os botões
- `text-base` (16px min) no textarea de comentário
- `min-h-dvh` no container principal
- `env(safe-area-inset-bottom)` no toolbar fixo
- Nunca usar `hover` como único indicador de interatividade
- Sem scroll aninhado

---

## Arquivos a modificar

| Arquivo                                         | Mudança                                                                       |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| `components/pdf-viewer/pdf-viewer.tsx`          | Rewrite: carrega docProxy, mapeia N PageRows, remove single-canvas logic      |
| `components/pdf-viewer/page-row.tsx`            | **Novo** — canvas por página com IntersectionObserver lazy render             |
| `components/pdf-viewer/page-comments.tsx`       | **Novo** — lista de comentários + input por página (desktop coluna / mobile Collapsible) |
| `components/pdf-viewer/pdf-viewer-store.ts`     | `setCurrentPage` vira `setCurrentPageFromScroll`; remover setter de botões    |
| `components/pdf-viewer/pdf-controls.tsx`        | Remover prev/next; manter zoom + indicador de página                          |
| `components/pdf-viewer/comments-sidebar.tsx`    | Deprecar ou remover (lógica migrada para `PageComments`)                      |
| `server/api/comments.ts`                        | Adicionar `listAll` procedure                                                 |
| `server/services/comments.service.ts`           | Adicionar `listAll` método                                                    |
| `app/(app)/scripts/[slug]/page.tsx` (ou client) | Remover layout sidebar-fixa; passar `allComments` para `PdfViewer`            |

---

## Acceptance criteria

- [ ] Todas as páginas do PDF renderizadas em scroll vertical contínuo (sem botões prev/next)
- [ ] Canvas não montado para páginas fora do viewport ±800px (IntersectionObserver lazy render)
- [ ] Desktop (lg+): grid 3fr/2fr por `PageRow` — canvas esquerda, comentários direita
- [ ] Tablet/Mobile: comentários em `<Collapsible>` abaixo de cada página (collapsed por padrão)
- [ ] Input de novo comentário disponível em cada página
- [ ] Reactions funcionam por página e invalidam cache corretamente
- [ ] Zoom (0.5–3.0) escala todas as páginas proporcionalmente
- [ ] Indicador "Página X / Y" no toolbar atualiza conforme scroll
- [ ] Sem nested scrolling no mobile
- [ ] `yarn build` sem erros de tipo
