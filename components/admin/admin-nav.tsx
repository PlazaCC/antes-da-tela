'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/admin/interpretes', label: 'Intérpretes' },
  { href: '/admin/editais', label: 'Editais' },
] as const

export function AdminNav({ className }: { className?: string }) {
  const pathname = usePathname()
  return (
    <nav className={cn('max-w-5xl mx-auto px-5 pt-6 flex gap-4 border-b border-border-default', className)}>
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'pb-3 text-sm font-semibold border-b-2 -mb-px',
            pathname.startsWith(link.href) ? 'border-brand-accent text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary',
          )}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
