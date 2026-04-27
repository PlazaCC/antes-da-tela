'use client'

import { useRef } from 'react'
import { usePDFViewerStore } from './pdf-viewer-store'
import { usePDFRender } from './use-pdf-render'
import { usePDFPan } from './use-pdf-pan'
import { PdfControls } from './pdf-controls'
import { PDFViewerError } from './pdf-viewer-error'

interface PDFViewerProps {
  url: string
}

export function PDFViewerInner({ url }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)

  const { currentPage, totalPages, zoom, isLoading } = usePDFViewerStore()

  const { pdfError, pageSize, containerWidthRef } = usePDFRender(url, canvasRef, containerRef, textLayerRef)

  const contentWidth = pageSize.width * zoom
  const contentHeight = pageSize.height * zoom

  const { pan, isDragging, handlePointerDown, handlePointerMove, handlePointerUp } = usePDFPan(
    containerRef,
    containerWidthRef,
    contentWidth,
    contentHeight,
    pageSize,
  )

  if (pdfError) {
    return <PDFViewerError message={pdfError} />
  }

  return (
    <div className='flex flex-col'>
      <PdfControls />

      <div
        ref={containerRef}
        className='relative w-full h-[80vh] overflow-hidden touch-none'
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}>
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

        <div
          className='absolute top-0 left-0'
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}>
          <canvas
            ref={canvasRef}
            className='block rounded-sm border border-border-subtle shadow-elevation-1'
            style={{
              width: contentWidth ? `${contentWidth}px` : 'auto',
              height: contentHeight ? `${contentHeight}px` : 'auto',
            }}
            aria-label={`Página ${currentPage} de ${totalPages}`}
          />
          <div
            ref={textLayerRef}
            className='absolute inset-0 pdf-text-layer pointer-events-none'
            style={{
              width: contentWidth ? `${contentWidth}px` : 'auto',
              height: contentHeight ? `${contentHeight}px` : 'auto',
            }}
            aria-hidden='true'
          />
        </div>
      </div>
    </div>
  )
}
