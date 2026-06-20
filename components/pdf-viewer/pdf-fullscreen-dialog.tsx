'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { PDFViewer } from './index'

interface PdfFullscreenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  title: string
  className?: string
}

/** Opens a PDF (e.g. pitch deck) in a full-screen modal reader. */
export function PdfFullscreenDialog({ open, onOpenChange, url, title, className }: PdfFullscreenDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          '!max-w-none w-screen h-dvh rounded-none p-0 gap-0 grid-rows-[auto_1fr] overflow-hidden',
          className,
        )}>
        <DialogHeader className='px-5 py-4 border-b border-border-subtle shrink-0'>
          <DialogTitle className='font-mono text-label-mono-default text-text-primary pr-8 truncate'>
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className='min-h-0 overflow-hidden'>
          <PDFViewer url={url} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
