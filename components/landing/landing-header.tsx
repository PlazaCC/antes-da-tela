'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { href: '#manifesto', label: 'Manifesto' },
  { href: '#plataforma', label: 'Plataforma' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#roteiros', label: 'Roteiros' },
]

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className='fixed inset-x-0 top-0 z-50 flex items-center justify-between'
      style={{
        padding: `${scrolled ? '14px' : '24px'} clamp(24px, 6vw, 80px)`,
        background: scrolled ? 'rgba(14,14,14,0.82)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
        borderBottom: scrolled ? '1px solid rgb(37,37,37)' : '1px solid transparent',
        transition: 'background 0.35s ease, padding 0.3s ease, border-color 0.35s ease',
      }}>
      <Link
        href='/'
        className='font-display text-[19px] text-text-primary no-underline flex items-center gap-2.5'>
        <span
          className='rounded-full bg-brand-accent shrink-0'
          style={{ width: 7, height: 7, transform: 'translateY(-7px)' }}
        />
        Antes da Tela
      </Link>

      <nav className='hidden md:flex items-center gap-8'>
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href} className='land-nav-a'>
            {l.label}
          </a>
        ))}
      </nav>

      <div className='flex items-center gap-3'>
        <a href='#waitlist' className='land-btn land-btn-ghost land-btn-sm hidden md:inline-flex'>
          Entrar
        </a>
        <a href='#waitlist' className='land-btn land-btn-primary land-btn-sm'>
          Acesso antecipado
          <span className='land-arrow'>→</span>
        </a>
      </div>
    </header>
  )
}
