import { HomeSkeleton } from '@/components/skeletons'
import { HydrateClient, getQueryClient, trpc } from '@/trpc/server'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HomeClient } from './home-client'

export const metadata: Metadata = {
  title: {
    absolute: 'Antes da Tela - Propriedades Intelectuais Audiovisuais',
  },
  description:
    'Publique, leia e proteja suas propriedades intelectuais audiovisuais. Roteiros, pitches e obras registradas em um só lugar.',
  openGraph: {
    title: 'Antes da Tela - Propriedades Intelectuais Audiovisuais',
    description:
      'Publique, leia e proteja suas propriedades intelectuais audiovisuais. Roteiros, pitches e obras registradas em um só lugar.',
    images: [{ url: '/antes-da-tela-og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Antes da Tela - Propriedades Intelectuais Audiovisuais',
    description:
      'Publique, leia e proteja suas propriedades intelectuais audiovisuais. Roteiros, pitches e obras registradas em um só lugar.',
    images: ['/antes-da-tela-og.png'],
  },
}

async function PrefetchedHome() {
  const queryClient = getQueryClient()
  await Promise.all([
    queryClient.prefetchQuery(trpc.scripts.listRecent.queryOptions({ limit: 12 })),
    queryClient.prefetchQuery(trpc.scripts.listFeatured.queryOptions()),
  ])
  return (
    <HydrateClient>
      <HomeClient />
    </HydrateClient>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <PrefetchedHome />
    </Suspense>
  )
}
