'use client'

interface PdfControlsProps {
  currentPage: number
  totalPages: number
  zoom: number
  onPrev: () => void
  onNext: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}

export function PdfControls({ currentPage, totalPages, zoom, onPrev, onNext, onZoomIn, onZoomOut }: PdfControlsProps) {
  return (
    <div
      id='pdf-toolbar'
      className='sticky top-0 z-10 flex items-center gap-2 px-3 py-2 bg-bg-base/90 backdrop-blur-sm border-b border-border-subtle'>
      {/* Page navigation — scrolls to the previous/next page */}
      <div className='bg-elevated border border-border-subtle rounded-sm flex items-center'>
        <button
          type='button'
          onClick={onPrev}
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
          onClick={onNext}
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
          onClick={onZoomOut}
          aria-label='Reduzir zoom'
          className='px-3 py-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary hover:text-text-primary font-medium transition-colors'>
          −
        </button>
        <span className='font-mono text-label-mono-small text-text-muted w-10 text-center tabular-nums select-none'>
          {Math.round(zoom * 100)}%
        </span>
        <button
          type='button'
          onClick={onZoomIn}
          aria-label='Aumentar zoom'
          className='px-3 py-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary hover:text-text-primary font-medium transition-colors'>
          +
        </button>
      </div>
    </div>
  )
}
