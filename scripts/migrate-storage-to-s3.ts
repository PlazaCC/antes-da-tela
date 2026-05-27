/**
 * Migrates all existing Supabase Storage files to S3.
 *
 * Usage:
 *   yarn migrate:storage           # dry run (preview only)
 *   yarn migrate:storage --execute # actually migrate
 *
 * Requires env vars: DATABASE_URL_UNPOOLED, NEXT_PUBLIC_SUPABASE_URL,
 *   SUPABASE_SERVICE_ROLE_KEY, AWS_REGION, AWS_ACCESS_KEY_ID,
 *   AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET
 */

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { config } from 'dotenv'
import postgres from 'postgres'

config({ path: '.env.local' })
config({ path: '.env' })

const DRY_RUN = !process.argv.includes('--execute')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const DATABASE_URL = process.env.DATABASE_URL_UNPOOLED!
const S3_BUCKET = process.env.AWS_S3_BUCKET!

const S3_PREFIXES = ['scripts/', 'audio/', 'covers/', 'banners/', 'pitch-decks/']

// ── Helpers ───────────────────────────────────────────────────────────────────

function isAlreadyMigrated(path: string | null): boolean {
  if (!path) return true
  return S3_PREFIXES.some((p) => path.startsWith(p))
}

function toS3Key(folder: string, supabasePath: string): string {
  return `${folder}/${supabasePath}`
}

function guessContentType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  }
  return map[ext ?? ''] ?? 'application/octet-stream'
}

async function downloadFromSupabase(bucket: string, path: string): Promise<Buffer> {
  const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
  })
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}): ${bucket}/${path}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function uploadToS3(s3: S3Client, key: string, body: Buffer, contentType: string): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
}

// ── Migration tasks ───────────────────────────────────────────────────────────

interface MigrationTask {
  label: string
  supabaseBucket: string
  s3Folder: string
  currentPath: string
  updateFn: (newKey: string) => Promise<void>
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🗂  Antes da Tela — Supabase → S3 storage migration`)
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN (pass --execute to apply)' : 'EXECUTE'}\n`)

  const db = postgres(DATABASE_URL, { max: 1 })
  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const tasks: MigrationTask[] = []

  // -- script_files (PDFs)
  const scriptFiles = await db<{ id: string; storage_path: string }[]>`
    SELECT id, storage_path FROM script_files WHERE storage_path IS NOT NULL
  `
  for (const row of scriptFiles) {
    if (isAlreadyMigrated(row.storage_path)) continue
    tasks.push({
      label: `script_files/${row.id}`,
      supabaseBucket: 'scripts',
      s3Folder: 'scripts',
      currentPath: row.storage_path,
      updateFn: async (key) => {
        await db`UPDATE script_files SET storage_path = ${key} WHERE id = ${row.id}`
      },
    })
  }

  // -- audio_files
  const audioFiles = await db<{ id: string; storage_path: string }[]>`
    SELECT id, storage_path FROM audio_files WHERE storage_path IS NOT NULL
  `
  for (const row of audioFiles) {
    if (isAlreadyMigrated(row.storage_path)) continue
    tasks.push({
      label: `audio_files/${row.id}`,
      supabaseBucket: 'audio',
      s3Folder: 'audio',
      currentPath: row.storage_path,
      updateFn: async (key) => {
        await db`UPDATE audio_files SET storage_path = ${key} WHERE id = ${row.id}`
      },
    })
  }

  // -- scripts.cover_path
  const scriptCovers = await db<{ id: string; cover_path: string }[]>`
    SELECT id, cover_path FROM scripts WHERE cover_path IS NOT NULL
  `
  for (const row of scriptCovers) {
    if (isAlreadyMigrated(row.cover_path)) continue
    tasks.push({
      label: `scripts.cover_path/${row.id}`,
      supabaseBucket: 'avatars',
      s3Folder: 'covers',
      currentPath: row.cover_path,
      updateFn: async (key) => {
        await db`UPDATE scripts SET cover_path = ${key} WHERE id = ${row.id}`
      },
    })
  }

  // -- scripts.banner_path
  const scriptBanners = await db<{ id: string; banner_path: string }[]>`
    SELECT id, banner_path FROM scripts WHERE banner_path IS NOT NULL
  `
  for (const row of scriptBanners) {
    if (isAlreadyMigrated(row.banner_path)) continue
    tasks.push({
      label: `scripts.banner_path/${row.id}`,
      supabaseBucket: 'avatars',
      s3Folder: 'banners',
      currentPath: row.banner_path,
      updateFn: async (key) => {
        await db`UPDATE scripts SET banner_path = ${key} WHERE id = ${row.id}`
      },
    })
  }

  // -- scripts.pitch_deck_path
  const scriptPitchDecks = await db<{ id: string; pitch_deck_path: string }[]>`
    SELECT id, pitch_deck_path FROM scripts WHERE pitch_deck_path IS NOT NULL
  `
  for (const row of scriptPitchDecks) {
    if (isAlreadyMigrated(row.pitch_deck_path)) continue
    tasks.push({
      label: `scripts.pitch_deck_path/${row.id}`,
      supabaseBucket: 'scripts',
      s3Folder: 'pitch-decks',
      currentPath: row.pitch_deck_path,
      updateFn: async (key) => {
        await db`UPDATE scripts SET pitch_deck_path = ${key} WHERE id = ${row.id}`
      },
    })
  }

  if (tasks.length === 0) {
    console.log('✅  Nothing to migrate — all files already have S3 keys.\n')
    await db.end()
    return
  }

  console.log(`📋  Found ${tasks.length} file(s) to migrate:\n`)

  let ok = 0
  let fail = 0

  for (const task of tasks) {
    const s3Key = toS3Key(task.s3Folder, task.currentPath)
    const contentType = guessContentType(task.currentPath)

    if (DRY_RUN) {
      console.log(`  [dry] ${task.label}`)
      console.log(`        ${task.supabaseBucket}/${task.currentPath}`)
      console.log(`        → s3://${S3_BUCKET}/${s3Key}`)
      ok++
      continue
    }

    process.stdout.write(`  ⬆  ${task.label} ... `)
    try {
      const body = await downloadFromSupabase(task.supabaseBucket, task.currentPath)
      await uploadToS3(s3, s3Key, body, contentType)
      await task.updateFn(s3Key)
      console.log('done')
      ok++
    } catch (err) {
      console.log(`FAILED: ${(err as Error).message}`)
      fail++
    }
  }

  console.log(`\n${DRY_RUN ? '📋  Dry run complete' : `✅  Migration complete`}: ${ok} ok, ${fail} failed\n`)

  await db.end()
}

main().catch((err) => {
  console.error('\n❌  Fatal error:', err)
  process.exit(1)
})
