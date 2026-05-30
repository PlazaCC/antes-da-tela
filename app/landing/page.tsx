
import { LandingClientShell } from '@/components/landing/landing-client-shell'
import { LandingHeader } from '@/components/landing/landing-header'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingMarquee } from '@/components/landing/landing-marquee'
import { LandingManifesto } from '@/components/landing/landing-manifesto'
import { LandingPillars } from '@/components/landing/landing-pillars'
import { LandingAudience } from '@/components/landing/landing-audience'
import { LandingHowItWorks } from '@/components/landing/landing-how-it-works'
import { LandingFeatured } from '@/components/landing/landing-featured'
import { LandingFinalCta } from '@/components/landing/landing-final-cta'
import { LandingFooter } from '@/components/landing/landing-footer'
import { HydrateClient, getQueryClient, trpc } from '@/trpc/server'

export const metadata = {
  title: 'Antes da Tela — Publique, leia e descubra roteiros',
  description: 'Plataforma de publicação, leitura e descoberta de roteiros audiovisuais brasileiros.',
}

export default async function LandingPage() {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(trpc.scripts.listRecent.queryOptions({ limit: 7 }))

  return (
    <HydrateClient>
      <LandingClientShell>
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
