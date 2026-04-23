'use client'

import { cn } from '@/lib/utils'
import { loadPdfjsLib } from '@/lib/utils/pdf'
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PDFViewerError } from './pdf-viewer-error'
import { usePDFViewerStore } from './pdf-viewer-store'

type PdfjsLib = typeof import('pdfjs-dist')

interface PDFViewerProps {
  url: string
}

export function PDFViewerInner({ url }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasWrapperRef = useRef<HTMLDivElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null)
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null)
  const textLayerTaskRef = useRef<{ cancel: () => void } | null>(null)
  const pdfjsRef = useRef<PdfjsLib | null>(null)
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { currentPage, totalPages, zoom, isLoading, setTotalPages, setLoading, setCurrentPage } = usePDFViewerStore()
  const [pdfError, setPdfError] = useState<string | null>(null)

  const renderPage = useCallback(async (pageNum: number, userZoom: number) => {
    if (!canvasRef.current || !canvasWrapperRef.current || !pdfDocRef.current || !pdfjsRef.current) return

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }
    if (textLayerTaskRef.current) {
      textLayerTaskRef.current.cancel()
      textLayerTaskRef.current = null
    }

    const page = (await pdfDocRef.current.getPage(pageNum)) as PDFPageProxy

    // Compute fit-to-width scale, then apply user zoom on top
    const naturalViewport = page.getViewport({ scale: 1 }) as PageViewport
    const containerWidth = canvasWrapperRef.current.clientWidth || naturalViewport.width
    const baseScale = containerWidth / naturalViewport.width
    const scale = baseScale * userZoom

    const viewport = page.getViewport({ scale }) as PageViewport
    const canvas = canvasRef.current
    const outputScale = window.devicePixelRatio || 1

    canvas.width = Math.floor(viewport.width * outputScale)
    canvas.height = Math.floor(viewport.height * outputScale)
    canvas.style.width = `${Math.floor(viewport.width)}px`
    canvas.style.height = `${Math.floor(viewport.height)}px`

    const context = canvas.getContext('2d')
    if (!context) return

    if (typeof context.resetTransform === 'function') {
      context.resetTransform()
    } else {
      context.setTransform(1, 0, 0, 1, 0, 0)
    }
    context.setTransform(outputScale, 0, 0, outputScale, 0, 0)
    context.clearRect(0, 0, canvas.width, canvas.height)

    const renderTask = page.render({ canvasContext: context, viewport, canvas })
    renderTaskRef.current = renderTask

    try {
      await renderTask.promise
    } catch (error) {
      if (error instanceof Error) {
        setPdfError(error.message)
      } else {
        setPdfError('Falha ao renderizar o PDF.')
      }
      pdfDocRef.current = null
      return
    } finally {
      renderTaskRef.current = null
    }

    // Text layer — enables text selection over the canvas
    if (textLayerRef.current) {
      const container = textLayerRef.current
      container.innerHTML = ''
      container.style.width = `${Math.floor(viewport.width)}px`
      container.style.height = `${Math.floor(viewport.height)}px`

      try {
        const tl = new pdfjsRef.current.TextLayer({
          textContentSource: page.streamTextContent(),
          container,
          viewport,
        })
        textLayerTaskRef.current = tl
        await tl.render()
      } catch {
        // text layer cancelled or unsupported
      } finally {
        textLayerTaskRef.current = null
      }
    }
  }, [])

  // Load PDF document once per URL
  useEffect(() => {
    let cancelled = false

    async function loadPDF() {
      setLoading(true)
      setPdfError(null)
      setCurrentPage(1)
      setTotalPages(0)

      const pdfjsLib = await loadPdfjsLib()
      pdfjsRef.current = pdfjsLib

      const pdf = await pdfjsLib.getDocument(url).promise
      if (cancelled) {
        pdf.destroy?.()
        return
      }

      pdfDocRef.current = pdf
      setTotalPages(pdf.numPages)
      setLoading(false)
      await renderPage(1, usePDFViewerStore.getState().zoom)
    }

    loadPDF().catch((error) => {
      console.error(error)
      if (!cancelled) {
        setPdfError(error instanceof Error ? error.message : 'Falha ao carregar o PDF.')
        setLoading(false)
        pdfDocRef.current = null
        setTotalPages(0)
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  // Re-render on page change using current zoom
  useEffect(() => {
    if (!pdfDocRef.current) return
    renderPage(currentPage, usePDFViewerStore.getState().zoom)
  }, [currentPage, renderPage])

  // Re-render on zoom change — debounced 300ms
  useEffect(() => {
    if (!pdfDocRef.current) return
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
    zoomTimerRef.current = setTimeout(() => {
      renderPage(usePDFViewerStore.getState().currentPage, usePDFViewerStore.getState().zoom)
    }, 300)
    return () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
    }
  }, [zoom, renderPage])

  // Re-render on container resize (e.g. sidebar toggle, window resize)
  useEffect(() => {
    if (!canvasWrapperRef.current) return
    const observer = new ResizeObserver(() => {
      if (!pdfDocRef.current) return
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = setTimeout(() => {
        renderPage(usePDFViewerStore.getState().currentPage, usePDFViewerStore.getState().zoom)
      }, 150)
    })
    observer.observe(canvasWrapperRef.current)
    return () => observer.disconnect()
  }, [renderPage])

  const goToPrev = () => currentPage > 1 && setCurrentPage(currentPage - 1)
  const goToNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1)

  const decreaseZoom = () => {
    const z = usePDFViewerStore.getState().zoom
    usePDFViewerStore.getState().setZoom(Math.max(0.5, Math.round((z - 0.25) * 4) / 4))
  }
  const increaseZoom = () => {
    const z = usePDFViewerStore.getState().zoom
    usePDFViewerStore.getState().setZoom(Math.min(3.0, Math.round((z + 0.25) * 4) / 4))
  }

  if (pdfError) {
    return <PDFViewerError message={pdfError} />
  }

  return (
    <div className='flex flex-col w-full'>
      {/* Controls bar — sticks to the top of the parent scroll container */}
      <div
        className={cn(
          'sticky top-0 left-2 z-10 p-2 max-w-fit rounded-lg',
          'bg-bg-base/20 backdrop-blur-sm',
          'flex items-center gap-3',
        )}>
        {/* PageController (ref: Figma 50:1837) */}
        <div className='bg-elevated border border-border-subtle rounded-sm flex items-center gap-2 px-3 py-1.5'>
          <button
            type='button'
            onClick={goToPrev}
            disabled={currentPage <= 1}
            aria-label='Previous page'
            className='text-text-secondary hover:text-text-primary disabled:opacity-30 text-sm min-w-[44px] min-h-[44px] flex items-center justify-center'>
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
            className='text-text-secondary hover:text-text-primary disabled:opacity-30 text-sm min-w-[44px] min-h-[44px] flex items-center justify-center'>
            →
          </button>
        </div>

        {/* ZoomController (ref: Figma 50:1836) */}
        <div className='bg-elevated border border-border-subtle rounded-sm flex items-center gap-1 px-2 py-1.5'>
          <button
            type='button'
            onClick={decreaseZoom}
            aria-label='Zoom out'
            className='text-text-secondary hover:text-text-primary min-w-[44px] min-h-[44px] flex items-center justify-center text-base font-medium'>
            −
          </button>
          <span className='font-mono text-label-mono-small text-text-muted w-10 text-center tabular-nums'>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type='button'
            onClick={increaseZoom}
            aria-label='Zoom in'
            className='text-text-secondary hover:text-text-primary min-w-[44px] min-h-[44px] flex items-center justify-center text-base font-medium'>
            +
          </button>
        </div>
      </div>

      {/* Canvas wrapper — fills container width, measured for fit-to-width scale */}
      <div ref={canvasWrapperRef} className='relative w-full'>
        {isLoading && (
          <div className='absolute inset-0 z-20 flex items-center justify-center bg-bg-base/70 backdrop-blur-sm min-h-[400px]'>
            <div className='flex flex-col items-center gap-3'>
              <div className='w-8 h-8 rounded-full border-2 border-border-subtle border-t-brand-accent animate-spin' />
              <span className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider'>Loading…</span>
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className='block rounded-sm border border-border-subtle shadow-elevation-1'
          aria-label={`PDF page ${currentPage} of ${totalPages}`}
        />
        <div ref={textLayerRef} className='pdf-text-layer' aria-hidden='true' />
      </div>
    </div>
  )
}
