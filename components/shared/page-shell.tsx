import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
  headerActions?: ReactNode
}

export function PageShell({ children, title, description, headerActions, className }: PageShellProps) {
  return (
    <main className={cn('max-w-5xl mx-auto px-5 py-12 flex flex-col gap-8', className)}>
      {(title || description || headerActions) && (
        <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div className='flex flex-col gap-2'>
            {title ? <h1 className='font-display text-heading-2 text-text-primary'>{title}</h1> : null}
            {description ? <p className='text-body-small text-text-secondary'>{description}</p> : null}
          </div>
          {headerActions ? <div className='flex items-center justify-end gap-3'>{headerActions}</div> : null}
        </div>
      )}
      {children}
    </main>
  )
}
