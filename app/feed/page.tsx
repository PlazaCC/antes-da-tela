import { HomeSkeleton } from '@/components/skeletons'
import { getAppUser } from '@/lib/auth/app-user'
import { redirectToOnboardingIfNeeded } from '@/lib/auth/onboarding'
import { HydrateClient, getQueryClient, trpc } from '@/trpc/server'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FeedClient } from './feed-client'

export const metadata: Metadata = {
  title: 'Descobrir roteiros',
  description: 'Explore roteiros, pitches e obras audiovisuais publicados na plataforma.',
}

async function PrefetchedFeed() {
  // Signed-in users land here after sign-up/login: first stop is the onboarding.
  await redirectToOnboardingIfNeeded(await getAppUser(), '/feed')

  const queryClient = getQueryClient()
  await Promise.all([
    queryClient.prefetchQuery(trpc.scripts.listRecent.queryOptions({ limit: 12 })),
    queryClient.prefetchQuery(trpc.scripts.listFeatured.queryOptions()),
  ])
  return (
    <HydrateClient>
      <FeedClient />
    </HydrateClient>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <PrefetchedFeed />
    </Suspense>
  )
}
