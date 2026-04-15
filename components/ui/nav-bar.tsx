import { Navigation, type NavigationItem } from '@/components/ui/navigation'
import { cn } from '@/lib/utils'
import * as React from 'react'

export interface NavBarProps extends React.HTMLAttributes<HTMLElement> {
  items: NavigationItem[]
}

export const NavBar = React.forwardRef<HTMLElement, NavBarProps>(({ className, items, ...props }, ref) => (
  <header
    ref={ref}
    className={cn('sticky top-0 z-10 w-full border-b border-border bg-surface/95 backdrop-blur-xl', className)}
    {...props}>
    <div className='mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4'>
      <div className='text-sm uppercase tracking-[0.35em] text-muted-foreground'>ANTES DA TELA</div>
      <Navigation items={items} orientation='horizontal' />
    </div>
  </header>
))
NavBar.displayName = 'NavBar'
