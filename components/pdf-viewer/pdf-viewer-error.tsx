'use client'

interface PDFViewerErrorProps {
  message: string
}

export function PDFViewerError({ message }: PDFViewerErrorProps) {
  return (
    <div className='flex flex-col w-full'>
      <div className='bg-surface border border-state-error/40 rounded-sm p-16 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]'>
        <div className='text-state-error text-2xl font-semibold'>PDF inválido</div>
        <p className='text-body-small text-text-muted max-w-[38rem]'>{message}</p>
      </div>
    </div>
  )
}
