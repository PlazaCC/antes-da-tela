

import { LandingClientShell } from '@/components/landing/landing-client-shell'
import { LandingHeader } from '@/components/landing/landing-header'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingMarquee } from '@/components/landing/landing-marquee'
import { LandingManifesto } from '@/components/landing/landing-manifesto'
import { LandingPillars } from '@/components/landing/landing-pillars'
import { LandingAudience } from '@/components/landing/landing-audience'
import { LandingHowItWorks } from '@/components/landing/landing-how-it-works'
import { LandingFeatured } from '@/components/landing/landing-featured'
import { LandingWaitlist } from '@/components/landing/landing-waitlist'
import { LandingFinalCta } from '@/components/landing/landing-final-cta'
import { LandingFooter } from '@/components/landing/landing-footer'

export const metadata = {
  title: 'Antes da Tela — Publique, leia e descubra roteiros',
  description: 'Plataforma de publicação, leitura e descoberta de roteiros audiovisuais brasileiros.',
}

export default function LandingPage() {
  return (
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
        <LandingWaitlist />
        <LandingFinalCta />
      </main>
      <LandingFooter />
    </LandingClientShell>
  )
}
