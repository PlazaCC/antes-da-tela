import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface InsightsSectionProps {
  title: string
  description?: string
  className?: string
  children: ReactNode
}

/** Bordered block with a small heading, used for each part of the script insights page. */
export function InsightsSection({ title, description, className, children }: InsightsSectionProps) {
  return (
    <section className={cn('bg-surface border border-border-default rounded-sm p-5', className)}>
      <h2 className='font-sans text-[14px] font-semibold text-text-primary'>{title}</h2>
      {description && <p className='text-body-small text-text-muted mt-1'>{description}</p>}
      <div className='mt-5'>{children}</div>
    </section>
  )
}
