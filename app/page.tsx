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

export const metadata: Metadata = {
  title: {
    absolute: 'Antes da Tela — Publique, leia e descubra roteiros',
  },
  description: 'Plataforma de publicação, leitura e descoberta de roteiros audiovisuais brasileiros.',
}

export default async function HomePage() {
  const queryClient = getQueryClient()
  const supabase = await createClient()
  const [, { data: claims }] = await Promise.all([
    queryClient.prefetchQuery(trpc.scripts.listRecent.queryOptions({ limit: 7 })),
    supabase.auth.getClaims(),
  ])

  // Logged-in users already have the global NavBar — skip the landing menu.
  const isAuthenticated = !!claims?.claims

  return (
    <HydrateClient>
      <LandingClientShell>
        {!isAuthenticated && <LandingHeader />}
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
