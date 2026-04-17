'use client'

import { cn } from '@/lib/utils'
import { useCallback, useEffect, useRef } from 'react'
import { usePDFViewerStore } from './pdf-viewer-store'

interface PDFViewerProps {
  url: string
}

export function PDFViewerInner({ url }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Cache the loaded PDF document so page/zoom changes don't re-fetch
  const pdfDocRef = useRef<{ getPage: (n: number) => Promise<unknown>; numPages: number } | null>(null)
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null)

  const { currentPage, totalPages, zoom, isLoading, setTotalPages, setLoading, setCurrentPage } =
    usePDFViewerStore()

  const renderPage = useCallback(
    async (pageNum: number, scale: number) => {
      if (!canvasRef.current || !pdfDocRef.current) return

      // Cancel any in-progress render before starting a new one
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }

      const page = await pdfDocRef.current.getPage(pageNum)
      const typedPage = page as {
        getViewport: (opts: { scale: number }) => { width: number; height: number }
        render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => {
          promise: Promise<void>
          cancel: () => void
        }
      }

      const viewport = typedPage.getViewport({ scale })
      const canvas = canvasRef.current
      canvas.width = viewport.width
      canvas.height = viewport.height

      const context = canvas.getContext('2d')
      if (!context) return

      const renderTask = typedPage.render({ canvasContext: context, viewport })
      renderTaskRef.current = renderTask

      try {
        await renderTask.promise
      } catch {
        // Render was cancelled — ignore
      } finally {
        renderTaskRef.current = null
      }
    },
    [], // stable: only refs used
  )

  // Load PDF document once when URL changes; reset page state for the new document
  useEffect(() => {
    let cancelled = false

    async function loadPDF() {
      setLoading(true)
      setCurrentPage(1)
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString()

      const pdf = await pdfjsLib.getDocument(url).promise
      if (cancelled) return

      pdfDocRef.current = pdf as typeof pdfDocRef.current
      setTotalPages(pdf.numPages)
      setLoading(false)
      await renderPage(1, 1.0)
    }

    loadPDF().catch(console.error)

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  // Re-render on page or zoom change
  useEffect(() => {
    if (!pdfDocRef.current) return
    renderPage(currentPage, zoom)
  }, [currentPage, zoom, renderPage])

  const goToPrev = () => currentPage > 1 && setCurrentPage(currentPage - 1)
  const goToNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1)

  // Read zoom from store directly to avoid stale closure on rapid clicks
  const decreaseZoom = () => {
    const z = usePDFViewerStore.getState().zoom
    usePDFViewerStore.getState().setZoom(Math.max(0.5, Math.round((z - 0.2) * 10) / 10))
  }
  const increaseZoom = () => {
    const z = usePDFViewerStore.getState().zoom
    usePDFViewerStore.getState().setZoom(Math.min(3.0, Math.round((z + 0.2) * 10) / 10))
  }

  return (
    <div className='relative flex flex-col gap-3'>
      {/* Controls bar — PageController + ZoomController */}
      <div
        className={cn(
          'sticky top-0 z-10 py-2 border-b border-border-subtle',
          'bg-bg-base/90 backdrop-blur-sm',
          'flex items-center gap-3',
        )}
      >
        {/* PageController (ref: Figma 50:1837) */}
        <div className='bg-elevated border border-border-subtle rounded-sm flex items-center gap-2 px-3 py-1.5'>
          <button
            type='button'
            onClick={goToPrev}
            disabled={currentPage <= 1}
            aria-label='Previous page'
            className='text-text-secondary hover:text-text-primary disabled:opacity-30 text-sm min-w-[44px] min-h-[44px] flex items-center justify-center'
          >
            ←
          </button>
          <span className='font-mono text-label-mono-default text-text-secondary tabular-nums'>
            {currentPage} / {totalPages || '—'}
          </span>
          <button
            type='button'
            onClick={goToNext}
            disabled={currentPage >= totalPages}
            aria-label='Next page'
            className='text-text-secondary hover:text-text-primary disabled:opacity-30 text-sm min-w-[44px] min-h-[44px] flex items-center justify-center'
          >
            →
          </button>
        </div>

        {/* ZoomController (ref: Figma 50:1836) */}
        <div className='bg-elevated border border-border-subtle rounded-sm flex items-center gap-1 px-2 py-1.5'>
          <button
            type='button'
            onClick={decreaseZoom}
            aria-label='Zoom out'
            className='text-text-secondary hover:text-text-primary min-w-[44px] min-h-[44px] flex items-center justify-center text-base font-medium'
          >
            −
          </button>
          <span className='font-mono text-label-mono-small text-text-muted w-10 text-center tabular-nums'>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type='button'
            onClick={increaseZoom}
            aria-label='Zoom in'
            className='text-text-secondary hover:text-text-primary min-w-[44px] min-h-[44px] flex items-center justify-center text-base font-medium'
          >
            +
          </button>
        </div>
      </div>

      {/* Loading overlay shown while a new document is being fetched */}
      {isLoading && (
        <div className='absolute inset-0 top-[52px] z-20 flex items-center justify-center bg-bg-base/70 backdrop-blur-sm'>
          <div className='flex flex-col items-center gap-3'>
            <div className='w-8 h-8 rounded-full border-2 border-border-subtle border-t-brand-accent animate-spin' />
            <span className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider'>
              Loading…
            </span>
          </div>
        </div>
      )}

      {/* PDF canvas */}
      <canvas
        ref={canvasRef}
        className='max-w-full rounded-sm border border-border-subtle shadow-elevation-1'
        aria-label={`PDF page ${currentPage} of ${totalPages}`}
      />
    </div>
  )
}
