import 'server-only'

import { s3, S3_BUCKET } from '@/lib/storage/s3-client'
import { isS3Key } from '@/lib/storage/url'
import { DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Deletes stored assets wherever they live: S3 keys (folder-prefixed) are
 * removed from the bucket, legacy paths from the given Supabase Storage bucket.
 *
 * Best effort — cleanup never fails the calling operation.
 */
export async function removeAssets(supabase: SupabaseClient, legacyBucket: string, keys: string[]): Promise<void> {
  const s3Keys = keys.filter(isS3Key)
  const legacyPaths = keys.filter((key) => !isS3Key(key))

  await Promise.all([
    s3Keys.length
      ? s3
          .send(new DeleteObjectsCommand({ Bucket: S3_BUCKET, Delete: { Objects: s3Keys.map((Key) => ({ Key })) } }))
          .catch((err) => console.error('S3 asset cleanup failed', err))
      : null,
    legacyPaths.length
      ? supabase.storage
          .from(legacyBucket)
          .remove(legacyPaths)
          .catch((err) => console.error('Supabase Storage asset cleanup failed', err))
      : null,
  ])
}

/** Deletes every S3 object under a prefix (e.g. `avatars/{userId}/`). Best effort. */
export async function removeS3Prefix(prefix: string): Promise<void> {
  try {
    const { Contents } = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix }))
    const keys = (Contents ?? []).map((o) => o.Key).filter((k): k is string => !!k)
    if (keys.length) {
      await s3.send(new DeleteObjectsCommand({ Bucket: S3_BUCKET, Delete: { Objects: keys.map((Key) => ({ Key })) } }))
    }
  } catch (err) {
    console.error('S3 prefix cleanup failed', err)
  }
}
