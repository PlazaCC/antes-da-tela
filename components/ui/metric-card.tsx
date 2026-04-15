import { cn } from '@/lib/utils'
import * as React from 'react'

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: React.ReactNode
  variation?: React.ReactNode
  color?: 'positive' | 'negative' | 'neutral'
}

const variantClasses: Record<NonNullable<MetricCardProps['color']>, string> = {
  positive: 'border-state-success/20 bg-state-success/10 text-state-success',
  negative: 'border-state-error/20 bg-state-error/10 text-state-error',
  neutral: 'border-foreground/10 bg-foreground/5 text-foreground',
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, variation, color = 'neutral', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-3xl border p-5 shadow-sm transition-colors', variantClasses[color], className)}
      {...props}>
      <p className='text-sm uppercase tracking-[0.24em] text-muted-foreground'>{title}</p>
      <div className='mt-3 flex items-end gap-3'>
        <span className='text-3xl font-semibold'>{value}</span>
        {variation ? <span className='text-sm'>{variation}</span> : null}
      </div>
    </div>
  ),
)
MetricCard.displayName = 'MetricCard'
