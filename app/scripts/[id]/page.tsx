import { ScriptPageSkeleton } from '@/components/skeletons'
import { getAssetUrl } from '@/lib/storage/url'
import { validateUUID } from '@/lib/validators/uuid'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/trpc/init'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { cache, Suspense } from 'react'
import { ScriptPageClient } from './script-page-client'

type Props = { params: Promise<{ id: string }> }

const getPageData = cache(async (id: string) => {
  const ctx = await createTRPCContext({ headers: await headers() })
  const caller = appRouter.createCaller(ctx)
  const [script, { data: authData }] = await Promise.all([caller.scripts.getById({ id }), ctx.supabase.auth.getUser()])

  const pdfUrl = getAssetUrl(script?.script_files?.[0]?.storage_path, 'scripts')
  const audios = (script?.audio_files ?? [])
    .map((a) => ({ url: getAssetUrl(a.storage_path, 'audio'), title: a.title, description: a.description }))
    .filter((a): a is { url: string; title: string; description: string | null } => !!a.url)
  const bannerUrl = getAssetUrl(script?.banner_path, 'avatars')
  const coverUrl = getAssetUrl(script?.cover_path, 'avatars')
  const pitchDeckUrl = getAssetUrl(script?.pitch_deck_path, 'scripts')

  return {
    script,
    pdfUrl,
    audios,
    bannerUrl,
    coverUrl,
    pitchDeckUrl,
    currentUserId: authData.user?.id ?? null,
  }
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  if (!validateUUID(id)) {
    notFound()
  }

  const { script, bannerUrl } = await getPageData(id)
  const title = script?.title ?? 'Roteiro'
  const description = script?.logline ?? 'Leia e discuta roteiros audiovisuais.'
  const image = bannerUrl ?? '/antes-da-tela-og.png'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ScriptPage({ params }: Props) {
  const { id } = await params

  if (!validateUUID(id)) {
    notFound()
  }

  const { script, pdfUrl, audios, bannerUrl, coverUrl, pitchDeckUrl, currentUserId } =
    await getPageData(id)

  return (
    <Suspense fallback={<ScriptPageSkeleton />}>
      <ScriptPageClient
        script={script}
        pdfUrl={pdfUrl}
        audios={audios}
        bannerUrl={bannerUrl}
        coverUrl={coverUrl}
        pitchDeckUrl={pitchDeckUrl}
        currentUserId={currentUserId}
      />
    </Suspense>
  )
}
