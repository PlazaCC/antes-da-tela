import { callResultSchema } from '@/lib/validators/votes'
import { votesRouter } from '@/server/api/votes'
import { VotesService } from '@/server/services/votes.service'
import { createTRPCRouter } from '@/trpc/init'
import type { SupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const USER = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const CALL = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'
const ENTRY = 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'

const emailVerified = vi.fn(async () => true)
vi.mock('@/lib/auth/email-verified', () => ({ hasVerifiedEmail: () => emailVerified() }))
vi.mock('@/lib/auth/app-user', () => ({
  getAppUser: vi.fn(async () => ({ id: USER, clerkId: 'user_x', email: 'a@b.com', name: 'Ana', image: null })),
}))
vi.mock('@/lib/storage/private-url', () => ({ getPrivateAssetUrl: vi.fn(async () => null) }))

function caller(insertError: unknown = null) {
  const insert = vi.fn(async () => ({ error: insertError }))
  const supabase = { from: vi.fn(() => ({ insert })) } as unknown as SupabaseClient
  const router = createTRPCRouter({ votes: votesRouter })
  return { insert, call: router.createCaller({ headers: new Headers(), user: null, supabase, votesService: new VotesService(supabase) } as never) }
}

describe('votes.vote', () => {
  beforeEach(() => emailVerified.mockResolvedValue(true))

  it('requires a verified e-mail', async () => {
    emailVerified.mockResolvedValue(false)
    const { call, insert } = caller()
    await expect(call.votes.vote({ callId: CALL, entryId: ENTRY })).rejects.toMatchObject({ code: 'FORBIDDEN' })
    expect(insert).not.toHaveBeenCalled()
  })

  it('records one vote', async () => {
    const { call, insert } = caller()
    await call.votes.vote({ callId: CALL, entryId: ENTRY })
    expect(insert).toHaveBeenCalledWith({ call_id: CALL, entry_id: ENTRY, user_id: USER })
  })

  it('a second vote in the same call is a conflict', async () => {
    const { call } = caller({ code: '23505', message: 'duplicate' })
    await expect(call.votes.vote({ callId: CALL, entryId: ENTRY })).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('RLS refusals (no document, call not voting) are forbidden', async () => {
    const { call } = caller({ code: '42501', message: 'rls' })
    await expect(call.votes.vote({ callId: CALL, entryId: ENTRY })).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})

describe('VotesService.getCounts', () => {
  it('returns null while totals are hidden (RPC returns no rows)', async () => {
    const service = new VotesService({ rpc: vi.fn(async () => ({ data: [], error: null })) } as unknown as SupabaseClient)
    await expect(service.getCounts(CALL)).resolves.toBeNull()
  })

  it('maps totals per entry', async () => {
    const service = new VotesService({ rpc: vi.fn(async () => ({ data: [{ entry_id: ENTRY, votes: '12' }], error: null })) } as unknown as SupabaseClient)
    await expect(service.getCounts(CALL)).resolves.toEqual({ [ENTRY]: 12 })
  })
})

describe('callResultSchema', () => {
  it('validates links, price and share', () => {
    const base = { callId: CALL, winnerEntryId: ENTRY, liveAt: null, liveUrl: null, ticketUrl: null, ticketPriceCents: 199, castSharePercent: 50, recordingUrl: null }
    expect(callResultSchema.safeParse(base).success).toBe(true)
    expect(callResultSchema.safeParse({ ...base, ticketUrl: 'not a url' }).success).toBe(false)
    expect(callResultSchema.safeParse({ ...base, castSharePercent: 120 }).success).toBe(false)
  })
})
