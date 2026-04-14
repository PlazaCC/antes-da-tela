import { cn } from '@/lib/utils'
import * as React from 'react'

export interface NavigationItem {
  label: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  active?: boolean
  href?: string
}

export interface NavigationProps extends React.HTMLAttributes<HTMLNavElement> {
  items: NavigationItem[]
  orientation?: 'horizontal' | 'vertical'
  onSelect?: (index: number) => void
}

export const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  ({ items, orientation = 'vertical', className, onSelect, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(orientation === 'vertical' ? 'flex flex-col gap-2' : 'flex flex-row gap-4', className)}
      {...props}>
      {items.map((item, i) => (
        <a
          key={item.label}
          href={item.href}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            item.active
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent hover:text-accent-foreground text-foreground',
          )}
          aria-current={item.active ? 'page' : undefined}
          onClick={(e) => {
            if (onSelect) {
              e.preventDefault()
              onSelect(i)
            }
          }}>
          {item.icon && <span>{item.icon}</span>}
          <span>{item.label}</span>
          {item.badge && <span className='ml-2'>{item.badge}</span>}
        </a>
      ))}
    </nav>
  ),
)
Navigation.displayName = 'Navigation'
