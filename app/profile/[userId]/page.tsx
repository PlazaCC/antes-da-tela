import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/trpc/init'
import { headers } from 'next/headers'
import { cache, Suspense } from 'react'
import { ProfileClient } from './profile-client'
import type { ScriptListItem } from '@/server/api/scripts'
import type { User } from '@/server/db/schema'

type PageData = { user: User | null; scripts: ScriptListItem[] }

const getPageData = cache(async (userId: string): Promise<PageData> => {
  const ctx = await createTRPCContext({ headers: await headers() })
  const caller = appRouter.createCaller(ctx)
  const [user, scripts] = await Promise.all([
    caller.users.getProfile({ id: userId }),
    caller.scripts.listByAuthor({ authorId: userId }),
  ])
  return { user, scripts }
})

async function ProfileData({ userId }: { userId: string }) {
  const { user, scripts } = await getPageData(userId)
  return <ProfileClient user={user} scripts={scripts} />
}

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = params.then(({ userId }) => userId)

  return (
    <Suspense fallback={<div className='min-h-screen bg-bg-base' />}>
      <ProfileDataWrapper paramsPromise={resolvedParams} />
    </Suspense>
  )
}

async function ProfileDataWrapper({ paramsPromise }: { paramsPromise: Promise<string> }) {
  const userId = await paramsPromise
  return <ProfileData userId={userId} />
}
