import { Suspense } from 'react'
import { trpc, HydrateClient, getQueryClient } from '@/trpc/server'
import { NavBar } from '@/components/navbar'
import { HomeClient } from './home-client'

export const metadata = {
  title: 'Antes da Tela — Roteiros audiovisuais',
  description: 'Plataforma de publicação, leitura e discussão de roteiros audiovisuais.',
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
    <>
      <NavBar />
      <Suspense>
        <PrefetchedHome />
      </Suspense>
    </>
  )
}
