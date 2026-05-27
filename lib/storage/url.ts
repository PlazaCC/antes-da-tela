const S3_PREFIXES = ['scripts/', 'audio/', 'covers/', 'banners/', 'pitch-decks/']

/**
 * Resolves a stored asset key/path to a public URL.
 *
 * New uploads (post-S3 migration) store keys with a folder prefix like
 * "scripts/{userId}/..." — these are served from S3/CDN.
 *
 * Legacy Supabase Storage paths have no folder prefix (e.g. "{userId}/file.pdf")
 * and are served from the Supabase public URL as a fallback.
 */
export function getAssetUrl(key: string | null | undefined, supabaseBucket?: string): string | null {
  if (!key) return null

  const isS3Key = S3_PREFIXES.some((prefix) => key.startsWith(prefix))

  if (isS3Key) {
    const base = process.env.NEXT_PUBLIC_S3_PUBLIC_URL?.replace(/\/$/, '')
    if (!base) return null
    return `${base}/${key}`
  }

  // Supabase Storage fallback for pre-migration files
  if (supabaseBucket) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
    if (!supabaseUrl) return null
    return `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${key}`
  }

  return null
}
