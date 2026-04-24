'use client'

import { useContainerWidth } from '@/lib/hooks/use-container-width'
import type { PDFPageProxy } from 'pdfjs-dist'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import { PdfControls } from './pdf-controls'
import { PDFViewerError } from './pdf-viewer-error'
import { usePDFViewerStore } from './pdf-viewer-store'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

type PDFViewerProps = {
  url: string
}

export function PDFViewerInner({ url }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const containerWidth = useContainerWidth(containerRef)
  const { currentPage, zoom, isLoading, setCurrentPage, setTotalPages, setLoading } = usePDFViewerStore()
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 })
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const contentWidth = useMemo(() => (containerWidth > 0 ? containerWidth * zoom : 0), [containerWidth, zoom])
  const contentHeight = useMemo(
    () => (pageSize.width > 0 ? contentWidth * (pageSize.height / pageSize.width) : 0),
    [contentWidth, pageSize.height, pageSize.width],
  )

  useEffect(() => {
    setPdfError(null)
    setCurrentPage(1)
    setTotalPages(0)
    setLoading(true)
    setPan({ x: 0, y: 0 })
  }, [url, setCurrentPage, setLoading, setTotalPages])

  useEffect(() => {
    const containerHeight = containerRef.current?.clientHeight ?? 0

    setPan((current) => {
      const maxX = 0
      const minX = Math.min(containerWidth - contentWidth, 0)
      const maxY = 0
      const minY = Math.min(containerHeight - contentHeight, 0)

      return {
        x: containerWidth && contentWidth > containerWidth ? Math.max(Math.min(current.x, maxX), minX) : 0,
        y: containerHeight && contentHeight > containerHeight ? Math.max(Math.min(current.y, maxY), minY) : 0,
      }
    })
  }, [containerWidth, contentWidth, contentHeight])

  useEffect(() => {
    if (!containerRef.current || !overlayRef.current) return

    const element = overlayRef.current
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      event.preventDefault()
      dragStartRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }
      setIsDragging(true)
      element.setPointerCapture(event.pointerId)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragStartRef.current) return
      event.preventDefault()
      const deltaX = event.clientX - dragStartRef.current.x
      const deltaY = event.clientY - dragStartRef.current.y
      const nextX = dragStartRef.current.panX + deltaX
      const nextY = dragStartRef.current.panY + deltaY
      const maxX = 0
      const minX = Math.min(containerWidth - contentWidth, 0)
      const maxY = 0
      const minY = Math.min((containerRef.current?.clientHeight ?? 0) - contentHeight, 0)
      setPan({ x: Math.max(Math.min(nextX, maxX), minX), y: Math.max(Math.min(nextY, maxY), minY) })
    }

    const handlePointerUp = () => {
      dragStartRef.current = null
      setIsDragging(false)
    }

    element.addEventListener('pointerdown', handlePointerDown)
    element.addEventListener('pointermove', handlePointerMove)
    element.addEventListener('pointerup', handlePointerUp)
    element.addEventListener('pointercancel', handlePointerUp)

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown)
      element.removeEventListener('pointermove', handlePointerMove)
      element.removeEventListener('pointerup', handlePointerUp)
      element.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [containerWidth, contentWidth, contentHeight, pan])

  const onDocumentLoadSuccess = useCallback(
    (pdf: { numPages: number }) => {
      setTotalPages(pdf.numPages)
      setLoading(false)
    },
    [setLoading, setTotalPages],
  )

  const onPageLoadSuccess = useCallback((page: PDFPageProxy) => {
    const viewport = page.getViewport({ scale: 1 })
    setPageSize({ width: viewport.width, height: viewport.height })
  }, [])

  const onDocumentLoadError = useCallback(
    (error: Error) => {
      setPdfError(error?.message ?? 'Falha ao carregar o PDF.')
      setLoading(false)
    },
    [setLoading],
  )

  if (pdfError) {
    return <PDFViewerError message={pdfError} />
  }

  return (
    <div className='flex flex-col'>
      <PdfControls />

      <div ref={containerRef} className='relative w-full overflow-x-auto overflow-y-hidden'>
        {isLoading && (
          <div className='absolute inset-0 z-20 flex items-center justify-center bg-bg-base/70 backdrop-blur-sm min-h-[400px]'>
            <div className='flex flex-col items-center gap-3'>
              <div className='w-8 h-8 rounded-full border-2 border-border-subtle border-t-brand-accent animate-spin' />
              <span className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider'>
                Carregando…
              </span>
            </div>
          </div>
        )}

        <div className='relative'>
          <div
            ref={dragRef}
            className='inline-block'
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}>
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className='animate-pulse bg-elevated h-[600px]' />}
              className='inline-block'>
              <Page
                pageNumber={currentPage}
                width={containerWidth > 0 ? containerWidth * zoom : undefined}
                onLoadSuccess={onPageLoadSuccess}
                renderTextLayer
                renderAnnotationLayer={false}
                className='block rounded-sm border border-border-subtle shadow-elevation-1'
              />
            </Document>
          </div>

          <div
            ref={overlayRef}
            className='absolute inset-0 z-0 cursor-grab pointer-events-none md:pointer-events-auto'
            style={{
              touchAction: 'pan-y',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
          />
        </div>
      </div>
    </div>
  )
}
