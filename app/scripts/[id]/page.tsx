import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/trpc/init'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { cache, Suspense } from 'react'
import { ScriptPageClient } from './script-page-client'

type Props = { params: Promise<{ id: string }> }

const getPageData = cache(async (id: string) => {
  const ctx = await createTRPCContext({ headers: await headers() })
  const caller = appRouter.createCaller(ctx)
  const [script, { data: authData }] = await Promise.all([
    caller.scripts.getById({ id }),
    ctx.supabase.auth.getUser(),
  ])

  let pdfUrl: string | null = null
  if (script?.script_files?.[0]?.storage_path) {
    const { data } = ctx.supabase.storage
      .from('scripts')
      .getPublicUrl(script.script_files[0].storage_path)
    pdfUrl = data.publicUrl
  }

  let audioUrl: string | null = null
  if (script?.audio_files?.[0]?.storage_path) {
    const { data } = ctx.supabase.storage
      .from('audio')
      .getPublicUrl(script.audio_files[0].storage_path)
    audioUrl = data.publicUrl
  }

  let bannerUrl: string | null = null
  if (script?.banner_path) {
    const { data } = ctx.supabase.storage
      .from('avatars')
      .getPublicUrl(script.banner_path)
    bannerUrl = data.publicUrl
  }

  let coverUrl: string | null = null
  if (script?.cover_path) {
    const { data } = ctx.supabase.storage
      .from('avatars')
      .getPublicUrl(script.cover_path)
    coverUrl = data.publicUrl
  }

  return {
    script,
    pdfUrl,
    audioUrl,
    bannerUrl,
    coverUrl,
    currentUserId: authData.user?.id ?? null,
  }
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { script, bannerUrl } = await getPageData(id)
  const title = script?.title ?? 'Roteiro'
  const description = script?.logline ?? 'Leia e discuta roteiros audiovisuais.'
  const image = bannerUrl ?? '/opengraph-image.png'
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
  const { script, pdfUrl, audioUrl, bannerUrl, coverUrl, currentUserId } = await getPageData(id)

  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-bg-base flex items-center justify-center'>
          <p className='text-text-secondary font-mono text-label-mono-default'>Loading…</p>
        </div>
      }
    >
      <ScriptPageClient 
        script={script} 
        pdfUrl={pdfUrl} 
        audioUrl={audioUrl} 
        bannerUrl={bannerUrl}
        coverUrl={coverUrl}
        currentUserId={currentUserId} 
      />
    </Suspense>
  )
}
