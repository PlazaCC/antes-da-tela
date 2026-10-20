import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

export const OG_SIZE = { width: 1200, height: 630 }

const BADGE_SIZE = 72
const BADGE_MARGIN = 28
const BADGE_MASK = Buffer.from(
  `<svg width="${BADGE_SIZE}" height="${BADGE_SIZE}"><circle cx="${BADGE_SIZE / 2}" cy="${BADGE_SIZE / 2}" r="${BADGE_SIZE / 2}"/></svg>`
)

async function loadSource(coverUrl: string | null): Promise<Buffer> {
  if (coverUrl) {
    const res = await fetch(coverUrl)
    if (res.ok) return Buffer.from(await res.arrayBuffer())
  }
  return readFile(join(process.cwd(), 'app/opengraph-image.png'))
}

async function loadBadge(): Promise<Buffer> {
  const icon = await readFile(join(process.cwd(), 'public/favicon/android-chrome-512x512.png'))
  return sharp(icon)
    .resize(BADGE_SIZE, BADGE_SIZE)
    .composite([{ input: BADGE_MASK, blend: 'dest-in' }])
    .png()
    .toBuffer()
}

/**
 * 1200x630 JPEG for link previews. Covers are mostly vertical posters, so the
 * whole cover is centred over a blurred, darkened copy of itself instead of
 * being cropped. JPEG keeps it light enough for WhatsApp (PNG photos were MBs).
 * Without a cover, the site's default OG image goes through the same layout.
 */
export async function renderScriptOgImage(coverUrl: string | null): Promise<Buffer> {
  const source = await loadSource(coverUrl)
  const [background, cover, badge] = await Promise.all([
    sharp(source)
      .resize(OG_SIZE.width, OG_SIZE.height, { fit: 'cover' })
      .blur(30)
      .modulate({ brightness: 0.45 })
      .toBuffer(),
    sharp(source)
      .resize(OG_SIZE.width, OG_SIZE.height, { fit: 'inside' })
      .toBuffer(),
    loadBadge(),
  ])

  return sharp(background)
    .composite([
      { input: cover, gravity: 'center' },
      { input: badge, top: BADGE_MARGIN, left: BADGE_MARGIN },
    ])
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer()
}
