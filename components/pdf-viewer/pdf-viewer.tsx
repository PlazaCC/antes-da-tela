'use client'

import { ErrorFallback } from '@/components/error-fallback'
import { usePdfjs } from '@/lib/hooks/use-pdfjs'
import type * as PdfjsLib from 'pdfjs-dist'
import { useEffect, useRef, useState } from 'react'
import { PdfControls } from './pdf-controls'
import { usePDFViewerStore } from './pdf-viewer-store'

interface PDFViewerProps {
  url: string
}

export function PDFViewerInner({ url }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfjs = usePdfjs()
  const { currentPage, zoom, isLoading, setTotalPages, setLoading } = usePDFViewerStore()
  const [error, setError] = useState<Error | null>(null)
  const docRef = useRef<PdfjsLib.PDFDocumentProxy | null>(null)

  // Scroll container to top when page changes
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [currentPage])

  // Load PDF document
  useEffect(() => {
    if (!pdfjs || !url) return

    setLoading(true)
    setError(null)

    const loadPdf = async () => {
      try {
        const doc = await pdfjs.getDocument(url).promise
        docRef.current = doc
        setTotalPages(doc.numPages)
        setLoading(false)
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        setLoading(false)
      }
    }

    loadPdf()

    return () => {
      docRef.current?.destroy()
      docRef.current = null
    }
  }, [pdfjs, url, setTotalPages, setLoading])

  // Render current page
  useEffect(() => {
    if (!pdfjs || !canvasRef.current || !docRef.current || currentPage < 1) return

    const renderPage = async () => {
      if (!docRef.current) return

      try {
        const page = await docRef.current.getPage(currentPage)
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        const viewport = page.getViewport({ scale: zoom })
        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({
          canvasContext: context,
          canvas: canvas,
          viewport: viewport,
        }).promise
      } catch (err) {
        console.error('Error rendering page:', err)
      }
    }

    renderPage()
  }, [pdfjs, currentPage, zoom])

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
