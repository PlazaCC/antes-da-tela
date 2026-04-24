import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface SectionCardProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
}

export function SectionCard({ children, title, description, className }: SectionCardProps) {
  return (
    <section className={cn('bg-surface border border-border-default rounded-sm p-6 shadow-sm', className)}>
      {(title || description) && (
        <div className='mb-6 space-y-1'>
          {title ? <h2 className='font-display text-heading-4 text-text-primary'>{title}</h2> : null}
          {description ? <p className='text-body-small text-text-secondary'>{description}</p> : null}
        </div>
      )}
      {children}
    </section>
  )
}
