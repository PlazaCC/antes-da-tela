import 'server-only'

import { s3, S3_BUCKET } from '@/lib/storage/s3-client'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/** S3 prefixes never served from the public CDN URL; read through presigned GETs only. */
export const PRIVATE_S3_PREFIXES = ['interpreters/'] as const

/**
 * Short-lived URL for a private S3 object. Callers must authorize the viewer
 * first (owner, admin, or an approved public badge).
 */
export async function getPrivateAssetUrl(key: string, expiresInSeconds = 3600): Promise<string | null> {
  try {
    return await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), { expiresIn: expiresInSeconds })
  } catch (error) {
    console.error('Presigned GET failed', error)
    return null
  }
}
