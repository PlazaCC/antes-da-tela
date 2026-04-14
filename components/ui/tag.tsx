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
  default: 'bg-secondary text-secondary-foreground border border-border',
  success: 'bg-green-100 text-green-800 border border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  error: 'bg-red-100 text-red-800 border border-red-200',
  crítico: 'bg-red-200 text-red-900 border border-red-300',
  importante: 'bg-orange-100 text-orange-800 border border-orange-200',
  neutro: 'bg-gray-100 text-gray-800 border border-gray-200',
  publicado: 'bg-blue-100 text-blue-800 border border-blue-200',
  rascunho: 'bg-gray-200 text-gray-700 border border-gray-300',
  privado: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
  drama: 'bg-purple-100 text-purple-800 border border-purple-200',
  thriller: 'bg-pink-100 text-pink-800 border border-pink-200',
  comédia: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  type10: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  new: 'bg-green-50 text-green-700 border border-green-100',
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
