'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [{ label: 'Embaixadores', href: '/embaixadores' }]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav aria-label='Navegação principal' className='hidden md:flex items-center gap-7'>
      {NAV_LINKS.map(({ label, href }) => {
        const isActive = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'text-sm font-medium transition-colors',
              isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary',
            )}>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
