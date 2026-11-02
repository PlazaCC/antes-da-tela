import { nextCallPhase } from '@/lib/constants/calls'
import { callUpsertSchema, enterCallSchema, reviewEntrySchema } from '@/lib/validators/calls'
import { CallsService } from '@/server/services/calls.service'
import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

const UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const CHARACTER = { name: 'Ana', modalities: ['acting' as const] }

describe('call phases', () => {
  it('advance in order and stop at finished', () => {
    expect(nextCallPhase('draft')).toBe('submissions')
    expect(nextCallPhase('voting')).toBe('finished')
    expect(nextCallPhase('finished')).toBeNull()
  })
})

describe('call validators', () => {
  it('slug must be kebab-case', () => {
    expect(callUpsertSchema.safeParse({ slug: 'frapa-2026', title: 'FRAPA 2026' }).success).toBe(true)
    expect(callUpsertSchema.safeParse({ slug: 'FRAPA 2026', title: 'FRAPA 2026' }).success).toBe(false)
  })

  it('an entry needs at least one character with a modality', () => {
    expect(enterCallSchema.safeParse({ callId: UUID, scriptId: UUID, characters: [] }).success).toBe(false)
    expect(enterCallSchema.safeParse({ callId: UUID, scriptId: UUID, characters: [{ name: 'Ana', modalities: [] }] }).success).toBe(false)
    expect(enterCallSchema.safeParse({ callId: UUID, scriptId: UUID, characters: [CHARACTER] }).success).toBe(true)
  })

  it('refusing an entry needs a reason', () => {
    expect(reviewEntrySchema.safeParse({ entryId: UUID, decision: 'rejected' }).success).toBe(false)
    expect(reviewEntrySchema.safeParse({ entryId: UUID, decision: 'approved' }).success).toBe(true)
  })
})

describe('CallsService.enter', () => {
  function supabaseWith(entryResult: unknown, charactersError: unknown = null) {
    const deleteEq = vi.fn(async () => ({ error: null }))
    const from = vi.fn((table: string) => {
      if (table === 'call_entries') {
        return {
          insert: () => ({ select: () => ({ single: async () => entryResult }) }),
          delete: () => ({ eq: deleteEq }),
        }
      }
      return { insert: async () => ({ error: charactersError }) }
    })
    return { client: { from } as unknown as SupabaseClient, deleteEq }
  }

  it('maps RLS refusals (closed call / unpublished script) to FORBIDDEN', async () => {
    const { client } = supabaseWith({ data: null, error: { code: '42501', message: 'rls' } })
    await expect(new CallsService(client).enter(UUID, { callId: UUID, scriptId: UUID, characters: [CHARACTER] })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
  })

  it('removes the entry when its characters cannot be saved', async () => {
    const { client, deleteEq } = supabaseWith({ data: { id: 'entry-1' }, error: null }, { message: 'boom' })
    await expect(new CallsService(client).enter(UUID, { callId: UUID, scriptId: UUID, characters: [CHARACTER] })).rejects.toThrow('boom')
    expect(deleteEq).toHaveBeenCalledWith('id', 'entry-1')
  })
})
