import { cn } from '@/lib/utils'
import * as React from 'react'

export interface DragZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
}

export const DragZone = React.forwardRef<HTMLDivElement, DragZoneProps>(
  ({ className, title = 'Drag & drop files here', subtitle = 'or click to upload', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border border-dashed border-border bg-background px-6 py-10 text-center transition hover:border-accent/80 hover:bg-surface',
        className,
      )}
      {...props}>
      <p className='text-lg font-semibold text-foreground'>{title}</p>
      <p className='mt-2 text-sm text-muted-foreground'>{subtitle}</p>
    </div>
  ),
)
DragZone.displayName = 'DragZone'
