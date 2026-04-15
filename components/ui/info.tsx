import { cn } from '@/lib/utils'
import * as React from 'react'

export interface InfoProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  badge?: string
}

export const Info = React.forwardRef<HTMLDivElement, InfoProps>(
  ({ className, title, description, badge, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-3xl border border-border bg-background p-6 shadow-sm', className)} {...props}>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground'>Info</p>
          <h3 className='mt-2 text-xl font-semibold text-foreground'>{title}</h3>
        </div>
        {badge ? (
          <span className='rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground'>
            {badge}
          </span>
        ) : null}
      </div>
      <p className='mt-4 text-sm leading-6 text-secondary-foreground'>{description}</p>
    </div>
  ),
)
Info.displayName = 'Info'
