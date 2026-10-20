import { OG_SIZE, renderScriptOgImage } from '@/lib/og/script-og-image'
import { getAssetUrl } from '@/lib/storage/url'
import { createClient } from '@supabase/supabase-js'

export const alt = 'Roteiro | Antes da Tela'
export const size = OG_SIZE
export const contentType = 'image/jpeg'

async function getCoverUrl(id: string): Promise<string | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
  const { data: script } = await supabase
    .from('scripts')
    .select('cover_path')
    .eq('id', id)
    .single()
  return getAssetUrl(script?.cover_path, 'avatars')
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Response> {
  const { id } = await params
  const coverUrl = await getCoverUrl(id).catch(() => null)
  // A cover sharp cannot decode falls back to the default image.
  const image = await renderScriptOgImage(coverUrl).catch(() =>
    renderScriptOgImage(null)
  )

  return new Response(new Uint8Array(image), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
