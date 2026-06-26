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
        showCloseButton={false}
        className={cn(
          'flex h-dvh w-screen !max-w-none flex-col gap-0 rounded-none p-0',
          className
        )}
      >
        {open ? (
          <PdfViewerProvider url={url}>
            <DialogHeader className="flex shrink-0 flex-row items-center justify-between gap-3 space-y-0 border-b border-border-subtle px-5 py-3">
              <DialogTitle className="truncate font-mono text-label-mono-default text-text-primary">
                {title}
              </DialogTitle>
              {/* Controls composed into the header, outside the canvas */}
              <PdfControls
                onClose={() => onOpenChange(false)}
                className="static h-full border-b-0 bg-transparent p-0 backdrop-blur-none"
              />
            </DialogHeader>
            <PdfCanvas className="min-h-0 flex-1" />
          </PdfViewerProvider>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
