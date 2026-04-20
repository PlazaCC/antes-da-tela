import { cn } from '@/lib/utils'

interface StatItemProps {
  value: string | number
  label: string
  className?: string
}

export function StatItem({ value, label, className }: StatItemProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className='font-display text-xl text-text-primary leading-tight'>{value}</span>
      <span className='font-mono text-[10px] tracking-[0.04em] text-text-muted uppercase'>{label}</span>
    </div>
  )
}
