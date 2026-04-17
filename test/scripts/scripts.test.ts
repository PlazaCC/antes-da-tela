import { scriptsRouter } from '@/server/api/scripts'
import { createTRPCRouter } from '@/trpc/init'
import type { SupabaseClient } from '@supabase/supabase-js'
import { TRPCError } from '@trpc/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Valid UUID v4s for tests (variant bits must satisfy [89abAB] in segment 4)
const USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const SCRIPT_ID = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'

const MOCK_USER = {
  id: USER_ID,
  email: 'author@example.com',
  user_metadata: { full_name: 'Test Author' },
}

const MOCK_SCRIPT = {
  id: SCRIPT_ID,
  title: 'Meu Roteiro',
  logline: 'Uma história incrível.',
  synopsis: 'Longa sinopse aqui.',
  genre: 'drama',
  age_rating: 'livre',
  author_id: USER_ID,
  status: 'published',
  is_featured: false,
  published_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  banner_path: null,
}

/** Build a minimal Supabase mock for a given table operation chain. */
function makeSupabaseMock(overrides: Record<string, unknown> = {}): SupabaseClient {
  const upsert = vi.fn(() => Promise.resolve({ error: null }))
  const selectAfterInsert = vi.fn(() => ({
    single: vi.fn(() => Promise.resolve({ data: MOCK_SCRIPT, error: null })),
  }))
  const insertScript = vi.fn(() => ({ select: selectAfterInsert }))
  const insertFile = vi.fn(() => Promise.resolve({ error: null }))
  const deleteScript = vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) }))

  const fromMap: Record<string, unknown> = {
    users: { upsert },
    scripts: {
      insert: insertScript,
      delete: deleteScript,
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: MOCK_SCRIPT, error: null })),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [MOCK_SCRIPT], error: null })),
          })),
        })),
      })),
    },
    script_files: { insert: insertFile },
    ...overrides,
  }

  return {
    from: vi.fn((table: string) => fromMap[table] ?? {}),
    auth: {
      getUser: vi.fn(async () => ({ data: { user: MOCK_USER }, error: null })),
    },
  } as unknown as SupabaseClient
}

function makeCtx(supabase: SupabaseClient, user = MOCK_USER) {
  return {
    headers: new Headers(),
    user,
    supabase,
  }
}

const router = createTRPCRouter({ scripts: scriptsRouter })

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------

describe('scriptsRouter.create', () => {
  let supabase: SupabaseClient

  beforeEach(() => {
    supabase = makeSupabaseMock()
  })

  it('returns the created script on success', async () => {
    const caller = router.createCaller(makeCtx(supabase))
    const result = await caller.scripts.create({
      title: 'Meu Roteiro',
      storagePath: 'scripts/user-1/file.pdf',
      logline: 'Uma história.',
    })
    expect(result.id).toBe(SCRIPT_ID)
    expect(result.title).toBe('Meu Roteiro')
  })

  it('upserts the author profile before inserting the script', async () => {
    const caller = router.createCaller(makeCtx(supabase))
    await caller.scripts.create({ title: 'Roteiro', storagePath: 'scripts/user-1/f.pdf' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fromMock = supabase.from as any
    expect(fromMock).toHaveBeenCalledWith('users')
  })

  it('throws INTERNAL_SERVER_ERROR when author upsert fails', async () => {
    const badUpsert = vi.fn(() => Promise.resolve({ error: { message: 'upsert failed' } }))
    supabase = makeSupabaseMock({ users: { upsert: badUpsert } })
    const caller = router.createCaller(makeCtx(supabase))
    await expect(
      caller.scripts.create({ title: 'Roteiro', storagePath: 'scripts/user-1/f.pdf' }),
    ).rejects.toThrow(TRPCError)
  })

  it('rolls back the script and throws when script_files insert fails', async () => {
    const failInsertFile = vi.fn(() => Promise.resolve({ error: { message: 'file insert failed' } }))
    const deleteEq = vi.fn(() => Promise.resolve({ error: null }))
    const deleteMock = vi.fn(() => ({ eq: deleteEq }))

    supabase = makeSupabaseMock({
      script_files: { insert: failInsertFile },
      scripts: {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: MOCK_SCRIPT, error: null })),
          })),
        })),
        delete: deleteMock,
      },
    })

    const caller = router.createCaller(makeCtx(supabase))
    await expect(
      caller.scripts.create({ title: 'Roteiro', storagePath: 'scripts/user-1/f.pdf' }),
    ).rejects.toThrow(TRPCError)

    // Verify rollback was attempted
    expect(deleteMock).toHaveBeenCalled()
    expect(deleteEq).toHaveBeenCalledWith('id', SCRIPT_ID)
  })
})

// ---------------------------------------------------------------------------
// getById
// ---------------------------------------------------------------------------

describe('scriptsRouter.getById', () => {
  it('returns the script when found', async () => {
    const supabase = makeSupabaseMock()
    const caller = router.createCaller(makeCtx(supabase))
    const result = await caller.scripts.getById({ id: SCRIPT_ID })
    expect(result?.id).toBe(SCRIPT_ID)
  })

  it('returns null when the script does not exist', async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
    } as unknown as SupabaseClient
    const caller = router.createCaller(makeCtx(supabase))
    // NIL UUID is a valid UUID format accepted by Zod and always returns no rows in DB
    const result = await caller.scripts.getById({ id: '00000000-0000-0000-0000-000000000000' })
    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// listRecent
// ---------------------------------------------------------------------------

describe('scriptsRouter.listRecent', () => {
  it('returns items and hasMore=false when fewer than limit results', async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [MOCK_SCRIPT], error: null })),
            })),
          })),
        })),
      })),
    } as unknown as SupabaseClient

    const caller = router.createCaller(makeCtx(supabase))
    const result = await caller.scripts.listRecent({ limit: 12 })
    expect(result.items).toHaveLength(1)
    expect(result.hasMore).toBe(false)
  })

  it('returns hasMore=true when results exceed limit', async () => {
    const twoItems = [MOCK_SCRIPT, { ...MOCK_SCRIPT, id: 'script-2' }]
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              // limit is called with limit+1; returning 2 items when limit=1 means hasMore=true
              limit: vi.fn(() => Promise.resolve({ data: twoItems, error: null })),
            })),
          })),
        })),
      })),
    } as unknown as SupabaseClient

    const caller = router.createCaller(makeCtx(supabase))
    const result = await caller.scripts.listRecent({ limit: 1 })
    expect(result.items).toHaveLength(1)
    expect(result.hasMore).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// search — input validation
// ---------------------------------------------------------------------------

describe('scriptsRouter.search — input validation', () => {
  it('rejects queries with PostgREST-special characters', async () => {
    const supabase = makeSupabaseMock()
    const caller = router.createCaller(makeCtx(supabase))
    await expect(caller.scripts.search({ query: 'foo%bar' })).rejects.toThrow()
    await expect(caller.scripts.search({ query: 'a,b' })).rejects.toThrow()
  })

  it('accepts normal search queries', async () => {
    const chain: Record<string, unknown> = {}
    chain.select = vi.fn(() => chain)
    chain.eq = vi.fn(() => chain)
    chain.or = vi.fn(() => chain)
    chain.limit = vi.fn(() => Promise.resolve({ data: [], error: null }))
    const supabase = {
      from: vi.fn(() => chain),
    } as unknown as SupabaseClient

    const caller = router.createCaller(makeCtx(supabase))
    const result = await caller.scripts.search({ query: 'drama urbano' })
    expect(Array.isArray(result)).toBe(true)
  })
})
