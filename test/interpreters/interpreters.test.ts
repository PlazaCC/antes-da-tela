import { isAdult, requiredMediaKind } from '@/lib/constants/interpreters'
import { interpreterReviewSchema, interpreterSubmissionSchema } from '@/lib/validators/interpreter'
import { adminRouter } from '@/server/api/admin'
import { interpretersRouter } from '@/server/api/interpreters'
import { createTRPCRouter } from '@/trpc/init'
import { InterpretersService } from '@/server/services/interpreters.service'
import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

const USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

vi.mock('@/lib/auth/app-user', () => ({
  getAppUser: vi.fn(async () => ({ id: USER_ID, clerkId: 'user_test', email: 'a@b.com', name: 'Ana', image: null })),
}))
vi.mock('@/lib/storage/private-url', () => ({ getPrivateAssetUrl: vi.fn(async () => 'https://signed.example/media') }))
vi.mock('@/lib/email/interpreter-review', () => ({ notifyInterpreterReview: vi.fn(async () => {}) }))

const VALID = {
  modalities: ['acting', 'narration'] as const,
  mediaPath: `interpreters/${USER_ID}/1_apresentacao.mp4`,
  mediaType: 'video' as const,
  durationSeconds: 28,
  birthDate: '1990-05-10',
  consent: true as const,
}

describe('interpreter rules', () => {
  it('acting (alone or with narration) needs a video; narration only, an audio', () => {
    expect(requiredMediaKind(['acting'])).toBe('video')
    expect(requiredMediaKind(['acting', 'narration'])).toBe('video')
    expect(requiredMediaKind(['narration'])).toBe('audio')
  })

  it('isAdult turns true exactly on the 18th birthday', () => {
    const today = new Date(Date.UTC(2026, 9, 29))
    expect(isAdult('2008-10-29', today)).toBe(true)
    expect(isAdult('2008-10-30', today)).toBe(false)
    expect(isAdult('not-a-date', today)).toBe(false)
  })
})

describe('interpreterSubmissionSchema', () => {
  it('accepts a complete registration', () => {
    expect(interpreterSubmissionSchema.safeParse(VALID).success).toBe(true)
  })

  it.each([
    ['minors', { birthDate: `${new Date().getFullYear() - 10}-01-01` }],
    ['media over 30s', { durationSeconds: 31 }],
    ['audio for an actor', { mediaType: 'audio' }],
    ['no consent', { consent: false }],
    ['no modality', { modalities: [] }],
    ['media outside the private prefix', { mediaPath: 'avatars/x.mp4' }],
  ])('rejects %s', (_, override) => {
    expect(interpreterSubmissionSchema.safeParse({ ...VALID, ...override }).success).toBe(false)
  })

  it('requires a reason to reject', () => {
    expect(interpreterReviewSchema.safeParse({ userId: USER_ID, decision: 'rejected' }).success).toBe(false)
    expect(interpreterReviewSchema.safeParse({ userId: USER_ID, decision: 'rejected', reason: 'Áudio com ruído' }).success).toBe(true)
    expect(interpreterReviewSchema.safeParse({ userId: USER_ID, decision: 'approved' }).success).toBe(true)
  })
})

function makeCaller(supabase: Partial<SupabaseClient>) {
  const client = supabase as SupabaseClient
  const router = createTRPCRouter({ admin: adminRouter, interpreters: interpretersRouter })
  return router.createCaller({
    headers: new Headers(),
    user: null,
    supabase: client,
    interpretersService: new InterpretersService(client),
  } as never)
}

describe('access', () => {
  it('admin procedures are forbidden for non-admins', async () => {
    const caller = makeCaller({ rpc: vi.fn(async () => ({ data: false, error: null })) as never })
    await expect(caller.admin.listInterpreters({ status: 'pending' })).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('submit refuses media uploaded under another user', async () => {
    const caller = makeCaller({ from: vi.fn() as never })
    await expect(
      caller.interpreters.submit({ ...VALID, modalities: [...VALID.modalities], mediaPath: 'interpreters/someone-else/1.mp4' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})
