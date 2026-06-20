import { HomeSkeleton } from '@/components/skeletons'
import { HydrateClient, getQueryClient, trpc } from '@/trpc/server'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FeedClient } from './feed-client'

export const metadata: Metadata = {
  title: 'Descobrir roteiros',
  description: 'Explore roteiros, pitches e obras audiovisuais publicados na plataforma.',
}

async function PrefetchedFeed() {
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
