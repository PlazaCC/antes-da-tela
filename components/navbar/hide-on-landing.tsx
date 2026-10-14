'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Hides the app chrome (NavBar, Footer) on the landing page, which has its own.
 *
 * Route-based on purpose: with `cacheComponents`, Next keeps visited pages
 * mounted (hidden) after a client navigation, so a `<style>` rule injected by
 * the landing page would keep hiding the header on /feed, /auth/sign-up, etc.
 */
export function HideOnLanding({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/' || pathname === '/landing') return null
  return <>{children}</>
}
