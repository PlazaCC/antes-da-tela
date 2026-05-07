# poc-27 — PDF Viewer: migrate to react-pdf

**Scope:** Frontend  
**Priority:** P0 — bug fix (zoom overflow) + fundação para sincronização áudio-texto futura  
**Status:** pending  
**Figma:** TBD — migração técnica, sem tela nova no Figma

---

## O que já está feito ✓

- PDF viewer funcional com canvas rendering via `pdfjs-dist` direto
- Text layer manual com seleção de texto (`pdfjsLib.TextLayer`)
- Zoom +/- com debounce de 300ms
- Paginação prev/next com controles acessíveis
- Zustand store (`usePDFViewerStore`) com `currentPage`, `totalPages`, `zoom`, `isLoading`
- `CommentsSidebar` consome `currentPage` do store para filtrar comentários por página
- `validatePdfStructure` em `lib/utils/pdf.ts` usado no fluxo de upload

---

## Gaps

### 1. Zoom causa overflow do container

A implementação atual redimensiona o `<canvas>` diretamente com base em `scale = baseScale * userZoom`. Ao aumentar o zoom acima de 1×, a largura do canvas ultrapassa o container, fazendo a página vazar horizontalmente.

`react-pdf` usa a prop `width` para fazer fit-to-width e `scale` apenas para multiplicar sobre essa largura, mantendo o elemento dentro do container.

**Arquivos:** `components/pdf-viewer/pdf-viewer.tsx`, `components/pdf-viewer/pdf-controls.tsx`

**Antes (problema):**
```tsx
// canvas se redimensiona para além do container
const scale = baseScale * userZoom
canvas.style.width = `${Math.floor(viewport.width)}px` // pode exceder container
```

**Depois (alvo):**
```tsx
import { Document, Page } from 'react-pdf'

// containerWidth é medido via ResizeObserver ou useRef
<Page
  pageNumber={currentPage}
  width={containerWidth}   // fit-to-width; react-pdf escala internamente
  scale={zoom}             // multiplicador aplicado sobre a largura base
  renderTextLayer={true}
  renderAnnotationLayer={false}
  onLoadSuccess={({ numPages }) => setTotalPages(numPages)} // em Document
/>
```

### 2. Remover render loop manual e ResizeObserver ad-hoc

A implementação atual tem ~120 linhas de lógica imperativa: `renderTaskRef`, `textLayerTaskRef`, `renderPage` callback, três `useEffect` distintos para URL/zoom/resize, mais `ResizeObserver` com debounce manual.

`react-pdf` encapsula todo esse ciclo internamente. O componente re-renderiza ao trocar `pageNumber`, `width` ou `scale`.

**Arquivo:** `components/pdf-viewer/pdf-viewer.tsx`

```tsx
'use client'

import { useRef, useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import { PdfControls } from './pdf-controls'
import { PDFViewerError } from './pdf-viewer-error'
import { usePDFViewerStore } from './pdf-viewer-store'
import { useContainerWidth } from '@/lib/hooks/use-container-width'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export function PDFViewerInner({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const containerWidth = useContainerWidth(containerRef) // hook com ResizeObserver
  const [error, setError] = useState<string | null>(null)
  const { currentPage, zoom, setTotalPages, setLoading } = usePDFViewerStore()

  const onDocumentLoad = useCallback(({ numPages }: { numPages: number }) => {
    setTotalPages(numPages)
    setLoading(false)
  }, [setTotalPages, setLoading])

  if (error) return <PDFViewerError message={error} />

  return (
    <div className="flex flex-col">
      <PdfControls />
      <div ref={containerRef} className="w-full overflow-hidden">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoad}
          onLoadError={(e) => setError(e.message)}
          loading={<div className="animate-pulse bg-elevated h-[600px]" />}
        >
          <Page
            pageNumber={currentPage}
            width={containerWidth || undefined}
            scale={zoom}
            renderTextLayer
            renderAnnotationLayer={false}
            className="block rounded-sm border border-border-subtle shadow-elevation-1"
          />
        </Document>
      </div>
    </div>
  )
}
```

### 3. Extrair hook useContainerWidth

O ResizeObserver para medir a largura do container deve ser extraído para um hook reutilizável (já seguindo as component rules do projeto).

**Arquivo novo:** `lib/hooks/use-container-width.ts`

```ts
import { useEffect, useRef, useState } from 'react'

export function useContainerWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [ref])

  return width
}
```

### 4. Verificar compatibilidade de versão react-pdf × pdfjs-dist

O projeto usa `pdfjs-dist ^5.6.205`. Verificar qual versão do `react-pdf` suporta pdfjs-dist v5:

```bash
yarn info react-pdf peerDependencies
```

- Se `react-pdf@9.x` exigir `pdfjs-dist@4.x`: adicionar resolution no `package.json` para forçar v5, ou usar `react-pdf@latest` se já suportar v5.
- O `validatePdfStructure` em `lib/utils/pdf.ts` continuará usando `pdfjs-dist` direto — garantir que seja a mesma versão que `react-pdf` usa internamente.
- Se houver conflito de versão, usar `resolutions` no `package.json`:
  ```json
  "resolutions": {
    "pdfjs-dist": "^5.6.205"
  }
  ```

### 5. Instalar react-pdf e importar CSS

```bash
yarn add react-pdf
```

O CSS do text layer deve ser importado uma única vez. O local recomendado é no componente `PDFViewerInner` ou no `app/globals.css`:

```tsx
// Em pdf-viewer.tsx:
import 'react-pdf/dist/Page/TextLayer.css'

// Se necessário desabilitar estilos padrão do text layer e manter os atuais
// (`.pdf-text-layer`), sobrescrever no globals.css após o import
```

### 6. Remover lib/utils/pdf.ts — função loadPdfjsLib

Com `react-pdf`, o carregamento do pdfjs é gerenciado internamente. A função `loadPdfjsLib` em `lib/utils/pdf.ts` se torna obsoleta.

Manter apenas `validatePdfStructure`, refatorando para usar `pdfjs-dist` diretamente (sem `loadPdfjsLib`):

```ts
// lib/utils/pdf.ts — após migração
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

export async function validatePdfStructure(file: File): Promise<string | null> {
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()
  try {
    const data = new Uint8Array(await file.arrayBuffer())
    const doc = await getDocument({ data }).promise
    doc.destroy()
    return null
  } catch (error) {
    return error instanceof Error ? `PDF inválido: ${error.message}` : 'PDF inválido.'
  }
}
```

### 7. Adaptar usePDFViewerStore — remover isLoading se não necessário

Com react-pdf, o estado de loading é gerenciado pelo `Document.loading` prop. Avaliar se `isLoading` no Zustand store ainda é necessário — se `CommentsSidebar` ou outro componente não o consome, remover para simplificar o store.

---

## Mobile & Tablet (Figma é desktop-only — especificação adicional)

Esta task é uma migração técnica; o comportamento visual no mobile deve ser equivalente ao atual. Garantir:

- Touch targets ≥44×44px nos botões de zoom e paginação (já implementado em `PdfControls`)
- `text-base` (16px min) em todos os inputs — não há inputs no viewer
- `min-h-dvh` já aplicado em `ScriptPageClient`
- `env(safe-area-inset-bottom)` já aplicado via `pb-[calc(54px+env(safe-area-inset-bottom))]`
- Zoom via react-pdf não deve overflow em nenhum breakpoint:
  - Phone (<768px): `containerWidth = viewport.width - padding` → fit correto
  - Tablet (768–1023px): idem
  - Desktop (≥1024px): `containerWidth = 50vw` (metade do split layout)

Testar zoom 1× → 1.5× → 2× em viewport de 375px sem scroll horizontal.

---

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `package.json` | `yarn add react-pdf`; adicionar `resolutions.pdfjs-dist` se necessário |
| `lib/utils/pdf.ts` | Remover `loadPdfjsLib`; refatorar `validatePdfStructure` para import direto |
| `lib/hooks/use-container-width.ts` | Criar hook novo com ResizeObserver |
| `components/pdf-viewer/pdf-viewer.tsx` | Reescrever com `Document` + `Page` de `react-pdf` |
| `components/pdf-viewer/index.tsx` | Manter dynamic import; garantir CSS import dentro do componente |
| `components/pdf-viewer/pdf-viewer-store.ts` | Avaliar remoção de `isLoading` se não consumido externamente |
| `app/globals.css` | Adicionar override de estilos do text layer se necessário |

---

## Acceptance criteria

- [ ] Zoom de 1× a 2× não causa scroll horizontal em nenhum breakpoint (375px, 768px, 1440px)
- [ ] Text layer preservado — seleção de texto funcional sobre o PDF
- [ ] `currentPage` do Zustand store atualiza corretamente ao trocar de página
- [ ] `CommentsSidebar` continua filtrando comentários pela página atual
- [ ] Loading state exibido durante carregamento do documento
- [ ] Error state exibido ao falhar carregamento (URL inválida ou PDF corrompido)
- [ ] `validatePdfStructure` continua funcional no fluxo de upload (`/publish`)
- [ ] `yarn add react-pdf` sem conflitos de peer deps (ou conflito resolvido via `resolutions`)
- [ ] `yarn build` sem erros de tipo
