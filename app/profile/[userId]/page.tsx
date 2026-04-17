import { appRouter } from '@/server/api/root'
import type { ScriptListItem } from '@/server/api/scripts'
import type { User } from '@/server/db/schema'
import { createTRPCContext } from '@/trpc/init'
import { headers } from 'next/headers'
import { ProfileClient } from './profile-client'

type PageData = { user: User | null; scripts: ScriptListItem[]; currentUserId: string | null }

async function getPageData(userId: string): Promise<PageData> {
  const ctx = await createTRPCContext({ headers: headers() })
  const caller = appRouter.createCaller(ctx)
  const [user, scripts, claimsResult] = await Promise.all([
    caller.users.getProfile({ id: userId }),
    caller.scripts.listByAuthor({ authorId: userId }),
    ctx.supabase.auth.getClaims(),
  ])
  const currentUserId = (claimsResult.data?.claims?.sub as string | undefined) ?? null
  return { user, scripts, currentUserId }
}

export default async function ProfilePage({ params }: { params: { userId: string } | Promise<{ userId: string }> }) {
  const { userId } = await params

  const { user, scripts, currentUserId } = await getPageData(userId)

  return <ProfileClient user={user} scripts={scripts} currentUserId={currentUserId} />
}
