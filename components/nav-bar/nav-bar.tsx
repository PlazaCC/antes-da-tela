'use client'

import { type NavigationItem } from '@/components/navigation/navigation'
import { cn } from '@/lib/utils'
import * as React from 'react'
import { useState } from 'react'

export interface NavBarProps extends React.HTMLAttributes<HTMLElement> {
  items: NavigationItem[]
  logo?: React.ReactNode
}

export const NavBar = React.forwardRef<HTMLElement, NavBarProps>(
  ({ className, items, logo, ...props }, ref) => {
    const [open, setOpen] = useState(false)

    return (
      <header
        ref={ref}
        className={cn('sticky top-0 z-40 w-full border-b border-border-default bg-bg-base/95 backdrop-blur-xl', className)}
        {...props}
      >
        <div className='mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4'>
          <div className='text-sm uppercase tracking-[0.35em] text-text-secondary font-mono'>
            {logo ?? 'ANTES DA TELA'}
          </div>

          {/* Desktop nav */}
          <nav className='hidden lg:flex flex-row gap-1' aria-label='Main navigation'>
            {items.map((item) => (
              <a
                key={item.href ?? item.label}
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-brand-accent text-text-primary'
                    : 'text-text-secondary hover:bg-elevated hover:text-text-primary',
                )}
              >
                {item.icon && <span aria-hidden='true'>{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge && <span className='ml-1'>{item.badge}</span>}
              </a>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            type='button'
            className='lg:hidden flex flex-col gap-1.5 p-2 rounded-sm text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors min-w-[44px] min-h-[44px] items-center justify-center'
            aria-expanded={open}
            aria-controls='mobile-nav'
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span
              className={cn(
                'block h-0.5 w-5 bg-current transition-transform duration-200',
                open && 'translate-y-2 rotate-45',
              )}
            />
            <span
              className={cn(
                'block h-0.5 w-5 bg-current transition-opacity duration-200',
                open && 'opacity-0',
              )}
            />
            <span
              className={cn(
                'block h-0.5 w-5 bg-current transition-transform duration-200',
                open && '-translate-y-2 -rotate-45',
              )}
            />
          </button>
        </div>

        {/* Mobile nav panel */}
        <div
          id='mobile-nav'
          className={cn(
            'lg:hidden border-t border-border-subtle overflow-hidden transition-all duration-200',
            open ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <nav className='flex flex-col gap-1 px-4 py-3' aria-label='Mobile navigation'>
            {items.map((item) => (
              <a
                key={item.href ?? item.label}
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-sm px-3 py-3 text-sm font-medium transition-colors min-h-[44px]',
                  item.active
                    ? 'bg-brand-accent text-text-primary'
                    : 'text-text-secondary hover:bg-elevated hover:text-text-primary',
                )}
                onClick={() => setOpen(false)}
              >
                {item.icon && <span aria-hidden='true'>{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge && <span className='ml-1'>{item.badge}</span>}
              </a>
            ))}
          </nav>
        </div>
      </header>
    )
  },
)
NavBar.displayName = 'NavBar'
