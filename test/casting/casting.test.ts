import { castingSubmitSchema } from '@/lib/validators/casting'
import { CastingService } from '@/server/services/casting.service'
import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/storage/private-url', () => ({ getPrivateAssetUrl: vi.fn(async () => 'https://signed.example/take') }))

const USER = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const ID = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'

describe('castingSubmitSchema', () => {
  it('accepts the registration media or a ≤30s private upload', () => {
    expect(castingSubmitSchema.safeParse({ characterId: ID, media: { source: 'profile' } }).success).toBe(true)
    const upload = { source: 'upload', path: `interpreters/${USER}/take.mp4`, type: 'video', durationSeconds: 30 }
    expect(castingSubmitSchema.safeParse({ characterId: ID, media: upload }).success).toBe(true)
    expect(castingSubmitSchema.safeParse({ characterId: ID, media: { ...upload, durationSeconds: 45 } }).success).toBe(false)
    expect(castingSubmitSchema.safeParse({ characterId: ID, media: { ...upload, path: 'audio/x.mp3' } }).success).toBe(false)
  })
})

describe('CastingService', () => {
  it('refuses uploads from another interpreter folder', async () => {
    const service = new CastingService({ from: vi.fn() } as unknown as SupabaseClient)
    await expect(
      service.submit(USER, { characterId: ID, media: { source: 'upload', path: 'interpreters/other/x.mp4', type: 'video', durationSeconds: 10 } }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('caps finalists at 3 per character', async () => {
    const update = vi.fn()
    const from = vi.fn(() => ({
      select: (_: string, opts?: { head?: boolean }) =>
        opts?.head
          ? { eq: () => ({ in: async () => ({ count: 3 }) }) }
          : { eq: () => ({ single: async () => ({ data: { character_id: ID } }) }) },
      update,
    }))
    const service = new CastingService({ from } as unknown as SupabaseClient)
    await expect(service.setStatus(ID, 'shortlisted')).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    expect(update).not.toHaveBeenCalled()
  })

  it('maps select_cast refusals to FORBIDDEN', async () => {
    const rpc = vi.fn(async () => ({ error: { code: '42501', message: 'cast selection not allowed' } }))
    const service = new CastingService({ rpc } as unknown as SupabaseClient)
    await expect(service.selectCast(ID)).rejects.toMatchObject({ code: 'FORBIDDEN' })
    expect(rpc).toHaveBeenCalledWith('select_cast', { p_submission_id: ID })
  })

  it('shows no characters to interpreters who are not approved', async () => {
    const from = vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { status: 'pending', modalities: ['acting'] } }) }) }) }))
    const service = new CastingService({ from } as unknown as SupabaseClient)
    await expect(service.openCharacters(USER, ID)).resolves.toEqual({ interpreterStatus: 'pending', characters: [] })
  })
})
