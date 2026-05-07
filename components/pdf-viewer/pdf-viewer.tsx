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
}

function isRenderingCancelledError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: string }).name === 'RenderingCancelledException'
  )
}

export function PDFViewerInner({ url }: PDFViewerProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerWidth = useContainerWidth(containerRef)
  const pdfjs = usePdfjs()
  const { currentPage, zoom, isLoading, setTotalPages, setLoading, setCurrentPage } = usePDFViewerStore()
  const [error, setError] = useState<Error | null>(null)
  const [isDocumentReady, setIsDocumentReady] = useState(false)
  const docRef = useRef<PdfjsLib.PDFDocumentProxy | null>(null)
  const renderTaskRef = useRef<ReturnType<PdfjsLib.PDFPageProxy['render']> | null>(null)
  const renderRequestIdRef = useRef(0)

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 })
  }, [currentPage])

  useEffect(() => {
    if (!pdfjs || !url) return
    const currentPdfjs = pdfjs

    setLoading(true)
    setError(null)
    setIsDocumentReady(false)
    setCurrentPage(1)
    setTotalPages(0)

    async function loadPdf(): Promise<void> {
      try {
        const doc = await currentPdfjs.getDocument(url).promise
        docRef.current = doc
        setTotalPages(doc.numPages)
        setIsDocumentReady(true)
        setLoading(false)
      } catch (err) {
        const parsedError = err instanceof Error ? err : new Error(String(err))
        setError(parsedError)
        setLoading(false)
        setIsDocumentReady(false)
      }
    }

    loadPdf()

    return () => {
      renderTaskRef.current?.cancel()
      renderTaskRef.current = null
      docRef.current?.destroy()
      docRef.current = null
      setIsDocumentReady(false)
    }
  }, [pdfjs, url, setTotalPages, setLoading, setCurrentPage])

  useEffect(() => {
    if (!pdfjs || !canvasRef.current || !docRef.current || currentPage < 1 || !isDocumentReady || containerWidth <= 0)
      return

    let isDisposed = false
    const renderRequestId = ++renderRequestIdRef.current

    async function cancelActiveRender(): Promise<void> {
      const activeTask = renderTaskRef.current
      if (!activeTask) return

      activeTask.cancel()
      try {
        await activeTask.promise
      } catch (err) {
        if (!isRenderingCancelledError(err)) {
          console.error('Error cancelling PDF render:', err)
        }
      } finally {
        if (renderTaskRef.current === activeTask) {
          renderTaskRef.current = null
        }
      }
    }

    async function renderPage(): Promise<void> {
      if (!docRef.current) return

      await cancelActiveRender()
      if (isDisposed || !docRef.current || renderRequestId !== renderRequestIdRef.current) return

      let renderTask: ReturnType<PdfjsLib.PDFPageProxy['render']> | null = null
      try {
        const page = await docRef.current.getPage(currentPage)
        if (isDisposed || renderRequestId !== renderRequestIdRef.current) return

        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        const baseViewport = page.getViewport({ scale: 1 })
        const fitWidthScale = containerWidth / baseViewport.width
        const viewport = page.getViewport({ scale: fitWidthScale * zoom })
        const devicePixelRatio = window.devicePixelRatio || 1
        canvas.width = Math.floor(viewport.width * devicePixelRatio)
        canvas.height = Math.floor(viewport.height * devicePixelRatio)
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`
        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
        context.clearRect(0, 0, viewport.width, viewport.height)

        if (isDisposed || renderRequestId !== renderRequestIdRef.current) return

        renderTask = page.render({
          canvasContext: context,
          canvas: canvas,
          viewport: viewport,
        })
        renderTaskRef.current = renderTask
        await renderTask.promise
      } catch (err) {
        if (!isRenderingCancelledError(err)) {
          console.error('Error rendering page:', err)
        }
      } finally {
        if (renderTask && renderTaskRef.current === renderTask) {
          renderTaskRef.current = null
        }
      }
    }

    void renderPage()

    return () => {
      isDisposed = true
      renderRequestIdRef.current += 1
      renderTaskRef.current?.cancel()
      renderTaskRef.current = null
    }
  }, [pdfjs, currentPage, zoom, isDocumentReady, containerWidth])

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
    <div className='flex flex-col'>
      <PdfControls />

      <div ref={containerRef} className='relative w-full h-[80vh] overflow-auto bg-bg-secondary'>
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

        <canvas ref={canvasRef} className='block mx-auto' />
      </div>
    </div>
  )
}
