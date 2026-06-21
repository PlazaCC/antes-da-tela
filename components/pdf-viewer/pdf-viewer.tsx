'use client'

import { type ReactElement } from 'react'
import { PdfCanvas } from './pdf-canvas'
import { PdfControls } from './pdf-controls'
import { PdfViewerProvider } from './pdf-viewer-context'

interface PDFViewerProps {
  url: string
  /** When true, mirror the visible page to the global store (for page-scoped comments). */
  syncToStore?: boolean
}

/**
 * Convenience composition: controls on top, scrollable pages below.
 *
 * For custom layouts (e.g. controls in a dialog header), compose the pieces
 * directly:
 *
 *   <PdfViewerProvider url={url}>
 *     <header><PdfControls /></header>
 *     <PdfCanvas className="flex-1" />
 *   </PdfViewerProvider>
 */
export function PDFViewerInner({ url, syncToStore = false }: PDFViewerProps): ReactElement {
  return (
    <PdfViewerProvider url={url} syncToStore={syncToStore}>
      <div className='flex flex-col h-full'>
        <PdfControls />
        <PdfCanvas className='flex-1 min-h-[60vh]' />
      </div>
    </PdfViewerProvider>
  )
}
