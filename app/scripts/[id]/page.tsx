import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/trpc/init'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { cache, Suspense } from 'react'
import ScriptPageClient from './script-page-client'

type Props = { params: Promise<{ id: string }> }

/**
 * React.cache deduplicates the DB round-trip between generateMetadata and the
 * page component — both run in the same request context.
 */
const getScript = cache(async (id: string) => {
  const ctx = await createTRPCContext({ headers: await headers() })
  const caller = appRouter.createCaller(ctx)
  return caller.scripts.getById({ id })
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const script = await getScript(id)
  return {
    title: script?.title ?? 'Roteiro',
    description: script?.logline ?? 'Leia e discuta roteiros audiovisuais.',
  }
}

export default async function ScriptPage({ params }: Props) {
  const { id } = await params
  const script = await getScript(id)

  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-bg-base flex items-center justify-center'>
          <p className='text-text-secondary font-mono text-label-mono-default'>Loading…</p>
        </div>
      }>
      <ScriptPageClient script={script} />
    </Suspense>
  )
}
