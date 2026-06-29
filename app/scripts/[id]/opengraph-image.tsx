import { getAssetUrl } from '@/lib/storage/url'
import { validateUUID } from '@/lib/validators/uuid'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/trpc/init'
import { headers } from 'next/headers'
import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'

export const alt = 'Roteiro | Antes da Tela'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const fallback = async () => {
    const data = await readFile(join(process.cwd(), 'public/antes-da-tela-og.png'))
    return new Response(data, { headers: { 'Content-Type': 'image/png' } })
  }

  if (!validateUUID(id)) return fallback()

  const ctx = await createTRPCContext({ headers: await headers() })
  const caller = appRouter.createCaller(ctx)
  const script = await caller.scripts.getById({ id }).catch(() => null)

  const bannerUrl = getAssetUrl(script?.banner_path, 'avatars')
  if (!bannerUrl) return fallback()

  const badgeData = await readFile(join(process.cwd(), 'public/favicon/android-chrome-512x512.png'), 'base64')
  const badgeSrc = `data:image/png;base64,${badgeData}`

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>
        {/* Banner */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient overlay for depth */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.55) 100%)',
          }}
        />
        {/* Antes da Tela badge */}
        <img
          src={badgeSrc}
          style={{
            position: 'absolute',
            bottom: 28,
            right: 28,
            width: 72,
            height: 72,
            borderRadius: 36,
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
