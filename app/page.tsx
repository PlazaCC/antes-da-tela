import { LandingAudience } from '@/components/landing/landing-audience'
import { LandingClientShell } from '@/components/landing/landing-client-shell'
import { LandingFeatured } from '@/components/landing/landing-featured'
import { LandingFinalCta } from '@/components/landing/landing-final-cta'
import { LandingFooter } from '@/components/landing/landing-footer'
import { LandingHeader } from '@/components/landing/landing-header'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingHowItWorks } from '@/components/landing/landing-how-it-works'
import { LandingPillars } from '@/components/landing/landing-pillars'
import { auth } from '@clerk/nextjs/server'
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
  // Signed-in users are normally redirected to /feed by proxy.ts already;
  // this is the fallback. Check BEFORE any data prefetch. Failures fall back
  // to the landing page; redirect() stays outside the try so NEXT_REDIRECT is
  // not swallowed.
  let isAuthenticated = false
  try {
    const { userId } = await auth()
    isAuthenticated = !!userId
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
        <LandingHeader />
        <main>
          <LandingHero />
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
