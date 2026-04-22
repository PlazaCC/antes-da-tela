'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Explorar', href: '/' },
  { label: 'Gêneros', href: '/?genre=' },
  { label: 'Em Alta', href: '/?trending=true' },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav aria-label='Navegação principal' className='hidden md:flex items-center gap-7'>
      {NAV_LINKS.map(({ label, href }) => {
        const basePath = href.split('?')[0]
        const isActive = basePath === '/' ? pathname === '/' : pathname.startsWith(basePath)
        return (
          <Link
            key={label}
            href={href}
            className={cn(
              'text-xs font-medium transition-colors',
              isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary',
            )}>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
