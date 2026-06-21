'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { PdfCanvas } from './pdf-canvas'
import { PdfControls } from './pdf-controls'
import { PdfViewerProvider } from './pdf-viewer-context'

interface PdfFullscreenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  title: string
  className?: string
}

/** Opens a PDF (e.g. pitch deck) in a full-screen modal reader. */
export function PdfFullscreenDialog({
  open,
  onOpenChange,
  url,
  title,
  className,
}: PdfFullscreenDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'h-dvh w-screen !max-w-none grid-rows-[auto_1fr] gap-0 overflow-hidden rounded-none p-0',
          className
        )}
      >
        {open ? (
          <PdfViewerProvider url={url}>
            <DialogHeader className="flex shrink-0 flex-row items-center justify-between gap-3 space-y-0 border-b border-border-subtle px-5 py-3">
              <DialogTitle className="truncate pr-8 font-mono text-label-mono-default text-text-primary">
                {title}
              </DialogTitle>
              {/* Controls composed into the header, outside the canvas */}
              <PdfControls className="static h-full border-b-0 bg-transparent p-0 pr-10 backdrop-blur-none" />
            </DialogHeader>
            <PdfCanvas className="h-full min-h-0" />
          </PdfViewerProvider>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
