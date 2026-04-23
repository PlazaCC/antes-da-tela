import { cn } from '@/lib/utils'

interface MetricCardProps {
  value: string
  label: string
  trend?: string
  trendColor?: 'positive' | 'negative' | 'neutral'
}

export function MetricCard({ value, label, trend, trendColor }: MetricCardProps) {
  const trendClass =
    trendColor === 'positive'
      ? 'text-brand-lime'
      : trendColor === 'negative'
        ? 'text-state-error'
        : 'text-text-muted'

  return (
    <div className='flex-1 min-w-0 bg-surface border border-border-default rounded-sm p-5'>
      <p className='font-display text-[24px] leading-[1.37] text-text-primary'>{value}</p>
      <p className='font-mono text-label-mono-small text-text-muted uppercase tracking-[0.04em] mt-2'>{label}</p>
      {trend && <p className={cn('font-mono text-[11px] font-medium mt-1', trendClass)}>{trend}</p>}
    </div>
  )
}
