import { cn } from '@/lib/utils'
import * as React from 'react'

export type TagVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'crítico'
  | 'importante'
  | 'neutro'
  | 'publicado'
  | 'rascunho'
  | 'privado'
  | 'drama'
  | 'thriller'
  | 'comédia'
  | 'type10'
  | 'new'

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant
  icon?: React.ReactNode
}

const variantClasses: Record<TagVariant, string> = {
  default: 'bg-surface text-foreground border border-border',
  success: 'bg-state-success/15 text-state-success border border-state-success/30',
  warning: 'bg-state-warning/15 text-state-warning border border-state-warning/30',
  error: 'bg-state-error/15 text-state-error border border-state-error/30',
  crítico: 'bg-state-error/15 text-state-error border border-state-error/30',
  importante: 'bg-brand-accent/15 text-brand-accent border border-brand-accent/30',
  neutro: 'bg-muted text-muted-foreground border border-border',
  publicado: 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30',
  rascunho: 'bg-muted/70 text-secondary-foreground border border-muted',
  privado: 'bg-surface text-secondary-foreground border border-muted',
  drama: 'bg-accent/15 text-accent border border-accent/30',
  thriller: 'bg-primary/15 text-primary border border-primary/30',
  comédia: 'bg-state-warning/15 text-state-warning border border-state-warning/30',
  type10: 'bg-secondary/20 text-secondary-foreground border border-secondary',
  new: 'bg-state-success/15 text-state-success border border-state-success/30',
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant = 'default', icon, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors',
        variantClasses[variant],
        className,
      )}
      {...props}>
      {icon && <span className='mr-1 flex-shrink-0'>{icon}</span>}
      {children}
    </span>
  ),
)
Tag.displayName = 'Tag'
