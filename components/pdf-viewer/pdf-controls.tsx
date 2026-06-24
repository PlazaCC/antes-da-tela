'use client'

import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  LucideIcon,
  Minus,
  Plus,
  Search,
  XIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../ui/button'
import { usePdfViewer } from './pdf-viewer-context'

interface PdfControlsProps {
  className?: string
  onClose?: () => void
}

/** Page navigation + zoom controls. Reads everything from context, so it can be
 * placed anywhere inside a <PdfViewerProvider> (e.g. a dialog header). */
export function PdfControls({ className, onClose }: PdfControlsProps) {
  const { currentPage, totalPages, zoom, goToPage, zoomIn, zoomOut } =
    usePdfViewer()

  return (
    <div
      id="pdf-toolbar"
      className={cn(
        'sticky top-0 z-10 flex h-full items-center gap-2 border-b border-border-subtle bg-bg-base/90 py-2 backdrop-blur-sm',
        className
      )}
    >
      {/* Page navigation — scrolls to the previous/next page */}
      <StepperControl
        icon={BookOpenText}
        prevIcon={<ArrowLeft />}
        nextIcon={<ArrowRight />}
        prevLabel="Página anterior"
        nextLabel="Próxima página"
        onPrev={() => goToPage(currentPage - 1)}
        onNext={() => goToPage(currentPage + 1)}
        prevDisabled={currentPage <= 1}
        nextDisabled={currentPage >= totalPages}
        hasBorder
      >
        <span className="select-none px-2 font-mono text-label-mono-small tabular-nums text-text-secondary">
          {currentPage} / {totalPages || '—'}
        </span>
      </StepperControl>

      {/* Zoom */}
      <StepperControl
        icon={Search}
        prevIcon={<Minus />}
        nextIcon={<Plus />}
        prevLabel="Reduzir zoom"
        nextLabel="Aumentar zoom"
        onPrev={zoomOut}
        onNext={zoomIn}
      >
        <span className="w-10 select-none text-center font-mono text-label-mono-small tabular-nums text-text-muted">
          {Math.round(zoom * 100)}%
        </span>
      </StepperControl>

      {/* Close */}
      {onClose && (
        <div className="ml-auto flex items-center border-l border-border-subtle pl-3">
          <Button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            variant="secondary"
            size="icon-xs"
          >
            <XIcon />
          </Button>
        </div>
      )}
    </div>
  )
}

interface StepperControlProps {
  /** Leading icon describing what is being stepped. */
  icon: LucideIcon
  prevIcon: ReactNode
  nextIcon: ReactNode
  prevLabel: string
  nextLabel: string
  onPrev: () => void
  onNext: () => void
  prevDisabled?: boolean
  nextDisabled?: boolean
  /** Middle content rendered between the two buttons (e.g. the current value). */
  children: ReactNode
  hasBorder?: boolean
}

// Icon + decrement/increment buttons around an arbitrary value display.
function StepperControl({
  icon,
  prevIcon,
  nextIcon,
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
  children,
  hasBorder,
}: StepperControlProps) {
  const Icon = icon

  return (
    <div
      className={cn(
        'flex h-full items-center gap-3 pl-3',
        hasBorder && 'border-r border-border-subtle pr-3'
      )}
    >
      <Icon className="size-5 text-border-subtle" />
      <div className="flex items-center">
        <Button
          type="button"
          onClick={onPrev}
          disabled={prevDisabled}
          aria-label={prevLabel}
          variant="secondary"
          size="icon-xs"
        >
          {prevIcon}
        </Button>
        {children}
        <Button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          aria-label={nextLabel}
          variant="secondary"
          size="icon-xs"
        >
          {nextIcon}
        </Button>
      </div>
    </div>
  )
}
