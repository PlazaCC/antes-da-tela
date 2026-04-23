'use client'

import { NAV_ITEMS } from '@/lib/constants/navigation'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className='fixed bottom-0 left-0 right-0 z-[100] md:sticky md:top-0 md:h-screen md:w-[240px] shrink-0 bg-surface/80 backdrop-blur-md border-t md:border-t-0 md:border-r border-border-default pb-[env(safe-area-inset-bottom)] md:pb-0 transition-all duration-300'>
      <nav className='flex flex-row md:flex-col h-[64px] md:h-full md:py-6 gap-0 md:gap-1 md:px-3'>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.disabled) {
            return (
              <div
                key={item.id}
                className='flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-1 md:px-3 h-full md:h-10 rounded-sm font-sans text-[10px] md:text-[13px] font-medium text-text-muted opacity-40 cursor-not-allowed'
                title='Em desenvolvimento'
                aria-disabled='true'>
                <Icon className='w-5 h-5 md:w-4 md:h-4 shrink-0' />
                <span className='truncate max-w-full text-center md:text-left'>{item.label}</span>
              </div>
            )
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-1 md:px-3 h-full md:h-10 rounded-sm font-sans text-[10px] md:text-[13px] font-medium transition-all duration-200',
                isActive
                  ? 'text-text-primary md:bg-elevated md:border-l-[3px] border-t-[2px] md:border-t-0 border-brand-accent'
                  : item.highlighted
                    ? 'text-brand-accent bg-brand-accent/5 border-t-[2px] md:border-t-0 border-transparent hover:bg-brand-accent/10'
                    : 'text-text-secondary hover:bg-elevated hover:text-text-primary border-t-[2px] md:border-t-0 border-transparent',
              )}>
              <Icon
                className={cn(
                  'w-5 h-5 md:w-4 md:h-4 shrink-0 transition-transform duration-200',
                  isActive && 'scale-110',
                  isActive || item.highlighted ? 'text-brand-accent' : 'text-text-muted',
                )}
              />
              <span className='truncate max-w-full text-center md:text-left'>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
