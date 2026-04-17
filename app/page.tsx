import { Suspense } from 'react'
import { trpc, HydrateClient, getQueryClient } from '@/trpc/server'
import { Skeleton } from '@/components/ui/skeleton'
import { HomeClient } from './home-client'

export const metadata = {
  title: 'Antes da Tela — Roteiros audiovisuais',
  description: 'Plataforma de publicação, leitura e discussão de roteiros audiovisuais.',
}

function HomeClientSkeleton() {
  return (
    <main className='max-w-[1140px] mx-auto px-5 pt-8 pb-16 flex flex-col gap-12'>
      <div className='flex gap-2 flex-wrap'>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className='h-8 w-20 rounded-full bg-elevated' />
        ))}
      </div>
      <section className='flex flex-col gap-5'>
        <Skeleton className='h-9 w-40 bg-elevated' />
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-40 bg-elevated rounded-sm' />
          ))}
        </div>
      </section>
    </main>
  )
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
    <Suspense fallback={<HomeClientSkeleton />}>
      <PrefetchedHome />
    </Suspense>
  )
}
