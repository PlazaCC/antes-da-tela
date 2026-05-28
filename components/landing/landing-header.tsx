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
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[clamp(24px,6vw,80px)] ${scrolled ? 'py-[14px] bg-[rgba(14,14,14,0.82)] border-b border-[rgb(37,37,37)] [backdrop-filter:blur(20px)_saturate(160%)] [webkit-backdrop-filter:blur(20px)_saturate(160%)]' : 'py-[24px] bg-transparent border-b border-transparent'} [transition:background_0.35s_ease,padding_0.3s_ease,border-color_0.35s_ease]`}
    >
      <Link
        href='/'
        className='font-display text-[19px] text-text-primary no-underline flex items-center gap-2.5'>
        <span
          className='rounded-full bg-brand-accent shrink-0 w-[7px] h-[7px] [transform:translateY(-7px)]'
        />
        Antes da Tela
      </Link>

      <nav className='hidden md:flex items-center gap-8'>
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className='relative text-[13px] font-medium text-[hsl(var(--color-text-secondary))] no-underline transition-colors hover:text-[hsl(var(--color-text-primary))] after:absolute after:left-0 after:right-full after:bottom-[-6px] after:h-[1px] after:bg-[hsl(var(--color-brand-accent))] after:content-[""] after:transition-[right_0.3s_ease] hover:after:right-0'>
            {l.label}
          </a>
        ))}
      </nav>

      <div className='flex items-center gap-3'>
        <a
          href='#waitlist'
          className='hidden md:inline-flex items-center justify-center gap-2.5 rounded-[2px] border border-[rgb(52,52,52)] bg-transparent px-4 h-9 text-[13px] font-semibold tracking-[0.01em] text-[hsl(var(--color-text-primary))] no-underline transition-[transform_0.2s_ease,background_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease,box-shadow_0.2s_ease] hover:border-[hsl(var(--color-brand-accent))] hover:text-[hsl(var(--color-brand-accent))] hover:-translate-y-[2px]'>
          Entrar
        </a>
        <a
          href='#waitlist'
          className='group inline-flex h-9 items-center justify-center gap-2.5 rounded-[2px] bg-[hsl(var(--color-brand-accent))] px-4 text-[13px] font-semibold tracking-[0.01em] text-[rgb(14,14,14)] no-underline transition-[transform_0.2s_ease,background_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease,box-shadow_0.2s_ease] hover:-translate-y-[2px] hover:shadow-[0_12px_32px_-10px_rgba(232,92,47,0.4)]'>
          Acesso antecipado
          <span className='transition-transform duration-200 group-hover:translate-x-[4px]'>→</span>
        </a>
      </div>
    </header>
  )
}
