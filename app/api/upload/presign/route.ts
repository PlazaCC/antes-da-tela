import { s3, S3_BUCKET } from '@/lib/storage/s3-client'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextResponse } from 'next/server'

const ALLOWED_CONTENT_TYPES = new Set([
  'application/pdf',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

const FOLDER_PREFIXES = ['scripts/', 'audio/', 'covers/', 'banners/', 'pitch-decks/']

export async function POST(request: Request) {
  const supabase = await createRouteHandlerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { key?: string; contentType?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { key, contentType } = body

  if (!key || !contentType) {
    return NextResponse.json({ error: 'key and contentType are required' }, { status: 400 })
  }

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'Content type not allowed' }, { status: 400 })
  }

  const hasValidPrefix = FOLDER_PREFIXES.some((prefix) => key.startsWith(prefix))
  if (!hasValidPrefix) {
    return NextResponse.json({ error: 'Invalid key prefix' }, { status: 400 })
  }

  // Enforce that the path segment after the folder prefix starts with the user's ID
  const withoutFolder = key.slice(key.indexOf('/') + 1)
  if (!withoutFolder.startsWith(user.id + '/')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
  })

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

  return NextResponse.json({ presignedUrl })
}
