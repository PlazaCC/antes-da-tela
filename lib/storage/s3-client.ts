import 'server-only'

import { S3Client } from '@aws-sdk/client-s3'

let client: S3Client | null = null

/**
 * Created on first use, not at import: `next build` evaluates route modules
 * while collecting page data, and a missing AWS_REGION there used to fail the
 * whole build ("Region is missing"). Now it only fails the request that needs S3.
 */
function getClient(): S3Client {
  if (!client) {
    const region = process.env.AWS_REGION
    if (!region) throw new Error('AWS_REGION is not configured: S3 uploads are unavailable')
    client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  }
  return client
}

/** The shared S3 client (lazy; same API as an S3Client instance). */
export const s3 = new Proxy({} as S3Client, {
  get(_target, property) {
    const instance = getClient()
    const value = Reflect.get(instance, property, instance)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})

export const S3_BUCKET = process.env.AWS_S3_BUCKET!
