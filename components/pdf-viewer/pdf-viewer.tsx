'use client'

import { ErrorFallback } from '@/components/error-fallback'
import { useContainerWidth } from '@/lib/hooks/use-container-width'
import { usePdfjs } from '@/lib/hooks/use-pdfjs'
import type * as PdfjsLib from 'pdfjs-dist'
import { type ReactElement, useEffect, useRef, useState } from 'react'
import { PdfControls } from './pdf-controls'
import { usePDFViewerStore } from './pdf-viewer-store'

interface PDFViewerProps {
  url: string
  /** When true, mirror the visible page to the global store (for page-scoped comments). */
  syncToStore?: boolean
}

const MIN_ZOOM = 0.5
const MAX_ZOOM = 3.0
const INTERSECTION_THRESHOLDS = Array.from({ length: 11 }, (_, i) => i / 10)

function isRenderingCancelledError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: string }).name === 'RenderingCancelledException'
  )
}

export function PDFViewerInner({ url, syncToStore = false }: PDFViewerProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const pageElRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map())
  const docRef = useRef<PdfjsLib.PDFDocumentProxy | null>(null)
  const renderedRef = useRef<Set<string>>(new Set())
  const ratiosRef = useRef<Map<number, number>>(new Map())
  const renderTasksRef = useRef<Map<number, ReturnType<PdfjsLib.PDFPageProxy['render']>>>(new Map())

  const containerWidth = useContainerWidth(containerRef)
  const pdfjs = usePdfjs()
  const syncCurrentPage = usePDFViewerStore((s) => s.setCurrentPage)

  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(1.0)
  const [currentPage, setCurrentPage] = useState(1)
  const [baseDims, setBaseDims] = useState<{ width: number; height: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDocumentReady, setIsDocumentReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // ── Load document ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pdfjs || !url) return
    const currentPdfjs = pdfjs

    setIsLoading(true)
    setError(null)
    setIsDocumentReady(false)
    setTotalPages(0)
    setCurrentPage(1)
    setBaseDims(null)
    renderedRef.current.clear()
    ratiosRef.current.clear()

    const renderTasks = renderTasksRef.current
    let cancelled = false

    async function loadPdf(): Promise<void> {
      try {
        const doc = await currentPdfjs.getDocument(url).promise
        if (cancelled) {
          doc.destroy()
          return
        }
        docRef.current = doc
        const firstPage = await doc.getPage(1)
        const viewport = firstPage.getViewport({ scale: 1 })
        if (cancelled) return
        setBaseDims({ width: viewport.width, height: viewport.height })
        setTotalPages(doc.numPages)
        setIsDocumentReady(true)
        setIsLoading(false)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
      }
    }

    loadPdf()

    return () => {
      cancelled = true
      renderTasks.forEach((task) => task.cancel())
      renderTasks.clear()
      docRef.current?.destroy()
      docRef.current = null
      setIsDocumentReady(false)
    }
  }, [pdfjs, url])

  // ── Render visible pages + track the current page ────────────────────────────
  useEffect(() => {
    if (!isDocumentReady || totalPages <= 0 || !baseDims || containerWidth <= 0 || !containerRef.current) return

    // Zoom / width changed — everything must re-render at the new scale.
    const renderTasks = renderTasksRef.current
    renderedRef.current.clear()
    renderTasks.forEach((task) => task.cancel())
    renderTasks.clear()

    const fitWidthScale = containerWidth / baseDims.width

    async function renderPage(n: number): Promise<void> {
      const key = `${n}@${zoom}@${containerWidth}`
      if (renderedRef.current.has(key)) return
      const canvas = canvasRefs.current.get(n)
      if (!canvas || !docRef.current) return
      renderedRef.current.add(key)

      renderTasksRef.current.get(n)?.cancel()
      try {
        const page = await docRef.current.getPage(n)
        const viewport = page.getViewport({ scale: fitWidthScale * zoom })
        const context = canvas.getContext('2d')
        if (!context) return
        const dpr = window.devicePixelRatio || 1
        canvas.width = Math.floor(viewport.width * dpr)
        canvas.height = Math.floor(viewport.height * dpr)
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`
        context.setTransform(dpr, 0, 0, dpr, 0, 0)
        const task = page.render({ canvasContext: context, canvas, viewport })
        renderTasksRef.current.set(n, task)
        await task.promise
      } catch (err) {
        if (!isRenderingCancelledError(err)) {
          console.error(`Error rendering page ${n}:`, err)
          renderedRef.current.delete(key) // allow a retry
        }
      } finally {
        renderTasksRef.current.delete(n)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const n = Number((entry.target as HTMLElement).dataset.page)
          if (!n) continue
          ratiosRef.current.set(n, entry.isIntersecting ? entry.intersectionRatio : 0)
          if (entry.isIntersecting) void renderPage(n)
        }
        // The most-visible page becomes the current page.
        let bestPage = 0
        let bestRatio = 0
        ratiosRef.current.forEach((ratio, page) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestPage = page
          }
        })
        if (bestPage > 0) {
          setCurrentPage(bestPage)
          if (syncToStore) syncCurrentPage(bestPage)
        }
      },
      { root: containerRef.current, rootMargin: '400px 0px', threshold: INTERSECTION_THRESHOLDS },
    )

    pageElRefs.current.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      renderTasks.forEach((task) => task.cancel())
      renderTasks.clear()
    }
  }, [isDocumentReady, totalPages, zoom, containerWidth, baseDims, syncToStore, syncCurrentPage])

  const goToPage = (target: number) => {
    const clamped = Math.max(1, Math.min(totalPages, target))
    pageElRefs.current.get(clamped)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const pageHeight = baseDims && containerWidth > 0 ? (containerWidth / baseDims.width) * baseDims.height * zoom : 0

  if (error) {
    return (
      <ErrorFallback
        title='Erro ao carregar PDF'
        message={`Não foi possível carregar o PDF. ${error.message}`}
        reset={() => setError(null)}
        className='min-h-[600px]'
      />
    )
  }

  return (
    <div className='flex flex-col h-full'>
      <PdfControls
        currentPage={currentPage}
        totalPages={totalPages}
        zoom={zoom}
        onPrev={() => goToPage(currentPage - 1)}
        onNext={() => goToPage(currentPage + 1)}
        onZoomIn={() => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + 0.25) * 4) / 4))}
        onZoomOut={() => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - 0.25) * 4) / 4))}
      />

      <div ref={containerRef} className='relative w-full flex-1 min-h-[60vh] overflow-auto bg-bg-secondary'>
        {isLoading && (
          <div className='absolute inset-0 z-20 flex items-center justify-center bg-bg-base/70 backdrop-blur-sm'>
            <div className='flex flex-col items-center gap-3'>
              <div className='w-8 h-8 rounded-full border-2 border-border-subtle border-t-brand-accent animate-spin' />
              <span className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider'>
                Carregando…
              </span>
            </div>
          </div>
        )}

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            data-page={n}
            ref={(el) => {
              if (el) pageElRefs.current.set(n, el)
              else pageElRefs.current.delete(n)
            }}
            style={pageHeight ? { minHeight: pageHeight } : undefined}
            className='flex justify-center py-2'>
            <canvas
              ref={(el) => {
                if (el) canvasRefs.current.set(n, el)
                else canvasRefs.current.delete(n)
              }}
              className='block max-w-full shadow-sm bg-white'
            />
          </div>
        ))}
      </div>
    </div>
  )
}
