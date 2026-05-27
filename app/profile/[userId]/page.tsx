import { appRouter } from '@/server/api/root'
import type { ScriptListItem, ProfileStats, UserProfile } from '@/lib/types'
import { createTRPCContext } from '@/trpc/init'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { ProfileClient } from './profile-client'

type PageData = { user: UserProfile | null; scripts: ScriptListItem[]; stats: ProfileStats }

async function getPageData(userId: string): Promise<PageData> {
  const ctx = await createTRPCContext({ headers: headers() })
  const caller = appRouter.createCaller(ctx)
  const [user, scripts, stats] = await Promise.all([
    caller.users.getProfile({ id: userId }),
    caller.scripts.listByAuthor({ authorId: userId }),
    caller.users.getProfileStats({ userId }),
  ])
  return { user, scripts, stats }
}

export async function generateMetadata({
  params,
}: {
  params: { userId: string } | Promise<{ userId: string }>
}): Promise<Metadata> {
  const { userId } = await params
  const { user } = await getPageData(userId)
  const name = user?.name ?? 'Perfil'
  return {
    title: name,
    description: `Confira os roteiros e obras de ${name} na plataforma Antes da Tela.`,
    openGraph: {
      title: `${name} | Antes da Tela`,
      description: `Confira os roteiros e obras de ${name} na plataforma Antes da Tela.`,
      images: [{ url: '/antes-da-tela-og.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | Antes da Tela`,
      images: ['/antes-da-tela-og.png'],
    },
  }
}

export default async function ProfilePage({
  params,
}: {
  params: { userId: string } | Promise<{ userId: string }>
}) {
  const { userId } = await params
  const { user, scripts, stats } = await getPageData(userId)
  return <ProfileClient user={user} scripts={scripts} stats={stats} />
}
