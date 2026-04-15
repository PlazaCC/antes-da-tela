import { cn } from '@/lib/utils'
import * as React from 'react'

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string
  variation: string
  color?: 'positive' | 'negative' | 'neutral'
}

const variantClasses: Record<NonNullable<MetricCardProps['color']>, string> = {
  positive: 'border-green-500/20 bg-green-500/10 text-green-100',
  negative: 'border-red-500/20 bg-red-500/10 text-red-100',
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
        <span className='text-sm'>{variation}</span>
      </div>
    </div>
  ),
)
MetricCard.displayName = 'MetricCard'
