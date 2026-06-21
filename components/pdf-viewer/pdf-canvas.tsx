'use client'

import { ErrorFallback } from '@/components/error-fallback'
import { useContainerWidth } from '@/lib/hooks/use-container-width'
import { cn } from '@/lib/utils'
import type * as PdfjsLib from 'pdfjs-dist'
import { useEffect, useRef } from 'react'
import { usePdfViewer } from './pdf-viewer-context'

const INTERSECTION_THRESHOLDS = Array.from({ length: 11 }, (_, i) => i / 10)

function isRenderingCancelledError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: string }).name === 'RenderingCancelledException'
  )
}

interface PdfCanvasProps {
  className?: string
}

/** Renders the document pages stacked vertically with lazy, viewport-driven rendering. */
export function PdfCanvas({ className }: PdfCanvasProps) {
  const {
    isDocumentReady,
    totalPages,
    zoom,
    baseDims,
    isLoading,
    error,
    resetError,
    docRef,
    pageElRefs,
    canvasRefs,
    setCurrentPage,
  } = usePdfViewer()

  const containerRef = useRef<HTMLDivElement>(null)
  const containerWidth = useContainerWidth(containerRef)
  const renderedRef = useRef<Set<string>>(new Set())
  const ratiosRef = useRef<Map<number, number>>(new Map())
  const renderTasksRef = useRef<Map<number, ReturnType<PdfjsLib.PDFPageProxy['render']>>>(new Map())

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

      renderTasks.get(n)?.cancel()
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
        renderTasks.set(n, task)
        await task.promise
      } catch (err) {
        if (!isRenderingCancelledError(err)) {
          console.error(`Error rendering page ${n}:`, err)
          renderedRef.current.delete(key) // allow a retry
        }
      } finally {
        renderTasks.delete(n)
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
        let bestPage = 0
        let bestRatio = 0
        ratiosRef.current.forEach((ratio, page) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestPage = page
          }
        })
        if (bestPage > 0) setCurrentPage(bestPage)
      },
      { root: containerRef.current, rootMargin: '400px 0px', threshold: INTERSECTION_THRESHOLDS },
    )

    pageElRefs.current.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      renderTasks.forEach((task) => task.cancel())
      renderTasks.clear()
    }
  }, [isDocumentReady, totalPages, zoom, containerWidth, baseDims, docRef, pageElRefs, canvasRefs, setCurrentPage])

  if (error) {
    return (
      <ErrorFallback
        title='Erro ao carregar PDF'
        message={`Não foi possível carregar o PDF. ${error.message}`}
        reset={resetError}
        className='min-h-[600px]'
      />
    )
  }

  const pageHeight = baseDims && containerWidth > 0 ? (containerWidth / baseDims.width) * baseDims.height * zoom : 0

  return (
    <div ref={containerRef} className={cn('relative w-full overflow-auto bg-bg-secondary', className)}>
      {isLoading && (
        <div className='absolute inset-0 z-20 flex items-center justify-center bg-bg-base/70 backdrop-blur-sm'>
          <div className='flex flex-col items-center gap-3'>
            <div className='w-8 h-8 rounded-full border-2 border-border-subtle border-t-brand-accent animate-spin' />
            <span className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider'>Carregando…</span>
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
  )
}
