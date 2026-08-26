import { LandingAudience } from '@/components/landing/landing-audience'
import { LandingClientShell } from '@/components/landing/landing-client-shell'
import { LandingFeatured } from '@/components/landing/landing-featured'
import { LandingFinalCta } from '@/components/landing/landing-final-cta'
import { LandingFooter } from '@/components/landing/landing-footer'
import { LandingHeader } from '@/components/landing/landing-header'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingHowItWorks } from '@/components/landing/landing-how-it-works'
import { LandingManifesto } from '@/components/landing/landing-manifesto'
import { LandingMarquee } from '@/components/landing/landing-marquee'
import { LandingPillars } from '@/components/landing/landing-pillars'
import { createClient } from '@/lib/supabase/server'
import { HydrateClient, getQueryClient, trpc } from '@/trpc/server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import './landing/landing.css'

export const metadata: Metadata = {
  title: {
    absolute:
      'Antes da Tela — Publique, leia e descubra propriedades intelectuais',
  },
  description:
    'Plataforma de publicação, leitura e descoberta de propriedades intelectuais audiovisuais.',
}

export default async function HomePage() {
  // Check auth BEFORE any data prefetch. getClaims() internally calls
  // getSession() which makes a network request to Supabase Auth — if that
  // request fails (timeout, network error), we catch it gracefully and show
  // the landing page instead of crashing. The redirect() call stays outside
  // the try-catch so NEXT_REDIRECT is not swallowed.
  let isAuthenticated = false
  try {
    const supabase = await createClient()
    const { data: claims } = await supabase.auth.getClaims()
    isAuthenticated = !!claims?.claims
  } catch {
    // Auth check failed — show landing page as fallback
  }

  if (isAuthenticated) {
    redirect('/feed')
  }

  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(
    trpc.scripts.listRecent.queryOptions({ limit: 7 })
  )

  return (
    <HydrateClient>
      <LandingClientShell>
        {/* Suppress the global app NavBar on the landing page */}
        <style>{`header[aria-label="Principal"] { display: none !important; } footer[aria-label="Rodapé"] { display: none !important; }`}</style>
        <LandingHeader />
        <main>
          <LandingHero />
          <LandingMarquee />
          <LandingManifesto />
          <LandingPillars />
          <LandingAudience />
          <LandingHowItWorks />
          <LandingFeatured />
          <LandingFinalCta />
        </main>
        <LandingFooter />
      </LandingClientShell>
    </HydrateClient>
  )
}
