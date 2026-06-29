import { getAssetUrl } from '@/lib/storage/url'
import { createClient } from '@supabase/supabase-js'
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Roteiro | Antes da Tela'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function fallback() {
  const data = await readFile(
    join(process.cwd(), 'public/favicon/android-chrome-192x192.png')
  )
  return new Response(data, { headers: { 'Content-Type': 'image/png' } })
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

    const { data: script } = await supabase
      .from('scripts')
      .select('cover_path')
      .eq('id', id)
      .single()

    const bannerUrl = getAssetUrl(script?.cover_path, 'avatars')

    if (!bannerUrl) return fallback()

    const badgeData = await readFile(
      join(process.cwd(), 'public/favicon/android-chrome-512x512.png'),
      'base64'
    )
    const badgeSrc = `data:image/png;base64,${badgeData}`

    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
        }}
      >
        <img
          src={bannerUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,transparent 100%)',
          }}
        />
        <img
          src={badgeSrc}
          style={{
            position: 'absolute',
            top: 28,
            left: 28,
            width: 72,
            height: 72,
            borderRadius: 36,
          }}
        />
      </div>,
      { width: 1200, height: 1200 }
    )
  } catch (err) {
    console.log('errooooooooo----------------', err)

    return fallback()
  }
}
