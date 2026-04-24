'use client'

import { usePDFViewerStore } from './pdf-viewer-store'

export function PdfControls() {
  const { currentPage, totalPages, zoom, setCurrentPage, setZoom } = usePDFViewerStore()

  const goToPrev = () => currentPage > 1 && setCurrentPage(currentPage - 1)
  const goToNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1)
  const decreaseZoom = () => setZoom(Math.max(0.5, Math.round((zoom - 0.25) * 4) / 4))
  const increaseZoom = () => setZoom(Math.min(3.0, Math.round((zoom + 0.25) * 4) / 4))

  return (
    <div className='sticky top-14 z-10 flex items-center gap-2 px-3 py-2 bg-bg-base/90 backdrop-blur-sm border-b border-border-subtle'>
      {/* Page navigation */}
      <div className='bg-elevated border border-border-subtle rounded-sm flex items-center'>
        <button
          type='button'
          onClick={goToPrev}
          disabled={currentPage <= 1}
          aria-label='Página anterior'
          className='px-3 py-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors'>
          ←
        </button>
        <span className='font-mono text-label-mono-small text-text-secondary tabular-nums px-2 select-none'>
          {currentPage} / {totalPages || '—'}
        </span>
        <button
          type='button'
          onClick={goToNext}
          disabled={currentPage >= totalPages}
          aria-label='Próxima página'
          className='px-3 py-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors'>
          →
        </button>
      </div>

      {/* Zoom */}
      <div className='bg-elevated border border-border-subtle rounded-sm flex items-center'>
        <button
          type='button'
          onClick={decreaseZoom}
          aria-label='Reduzir zoom'
          className='px-3 py-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary hover:text-text-primary font-medium transition-colors'>
          −
        </button>
        <span className='font-mono text-label-mono-small text-text-muted w-10 text-center tabular-nums select-none'>
          {Math.round(zoom * 100)}%
        </span>
        <button
          type='button'
          onClick={increaseZoom}
          aria-label='Aumentar zoom'
          className='px-3 py-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary hover:text-text-primary font-medium transition-colors'>
          +
        </button>
      </div>
    </div>
  )
}
