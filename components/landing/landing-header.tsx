'use client'

import Image from 'next/image'
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
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[clamp(24px,6vw,80px)] ${scrolled ? 'border-b border-[rgb(37,37,37)] bg-[rgba(14,14,14,0.82)] py-[14px] [backdrop-filter:blur(20px)_saturate(160%)] [webkit-backdrop-filter:blur(20px)_saturate(160%)]' : 'border-b border-transparent bg-transparent py-[24px]'} [transition:background_0.35s_ease,padding_0.3s_ease,border-color_0.35s_ease]`}
    >
      <Link href="/" className="flex shrink-0 items-center no-underline">
        <Image
          src="/logo-white.svg"
          alt="Antes da Tela"
          className="h-9 w-auto max-w-full md:h-10"
          width={475}
          height={87}
          priority
        />
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className='relative text-[13px] font-medium text-[hsl(var(--color-text-secondary))] no-underline transition-colors after:absolute after:bottom-[-6px] after:left-0 after:right-full after:h-[1px] after:bg-[hsl(var(--color-brand-accent))] after:transition-[right_0.3s_ease] after:content-[""] hover:text-[hsl(var(--color-text-primary))] hover:after:right-0'
          >
            {l.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="hidden h-9 items-center justify-center gap-2.5 rounded-[2px] border border-[rgb(52,52,52)] bg-transparent px-4 text-[13px] font-semibold tracking-[0.01em] text-[hsl(var(--color-text-primary))] no-underline transition-[transform_0.2s_ease,background_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease,box-shadow_0.2s_ease] hover:-translate-y-[2px] hover:border-[hsl(var(--color-brand-accent))] hover:text-[hsl(var(--color-brand-accent))] md:inline-flex"
        >
          Entrar
        </Link>
        <Link
          href="/auth/login"
          className="group inline-flex h-9 items-center justify-center gap-2.5 rounded-[2px] bg-[hsl(var(--color-brand-accent))] px-4 text-[13px] font-semibold tracking-[0.01em] text-[rgb(255,255,255)] no-underline transition-[transform_0.2s_ease,background_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease,box-shadow_0.2s_ease] hover:-translate-y-[2px] hover:shadow-[0_12px_32px_-10px_rgba(28,114,215,0.4)]"
        >
          Cadastrar
          <span className="transition-transform duration-200 group-hover:translate-x-[4px]">
            →
          </span>
        </Link>
      </div>
    </header>
  )
}
