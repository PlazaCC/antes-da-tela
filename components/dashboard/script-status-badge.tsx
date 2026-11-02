import { SCRIPT_STATUS_BG_CLASSES, SCRIPT_STATUS_LABELS } from '@/lib/constants/scripts'
import { cn } from '@/lib/utils'

interface ScriptStatusBadgeProps {
  status: string
  className?: string
}

export function ScriptStatusBadge({ status, className }: ScriptStatusBadgeProps) {
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border',
        SCRIPT_STATUS_BG_CLASSES[status] ?? 'bg-text-muted/5 border-text-muted/20 text-text-muted',
        className,
      )}>
      {SCRIPT_STATUS_LABELS[status] ?? status}
    </span>
  )
}
