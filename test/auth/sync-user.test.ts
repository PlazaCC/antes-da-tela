import { beforeEach, describe, expect, it, vi } from 'vitest'

type Row = { id: string; email: string; name: string; image: string | null; clerk_id: string | null }

// Minimal in-memory stand-in for the service-role client: only the query
// shapes syncClerkUser uses on `users`.
let rows: Row[] = []

function query(op: 'select' | 'update' | 'insert', payload?: Partial<Row>) {
  const filters: ((r: Row) => boolean)[] = []
  const run = () => {
    if (op === 'insert') {
      const row = { id: `id-${rows.length + 1}`, image: null, clerk_id: null, ...payload } as Row
      if (rows.some((r) => r.email === row.email || (row.clerk_id && r.clerk_id === row.clerk_id))) {
        return { data: null, error: { code: '23505', message: 'duplicate key' } }
      }
      rows.push(row)
      return { data: [row], error: null }
    }
    const matched = rows.filter((r) => filters.every((f) => f(r)))
    if (op === 'update') matched.forEach((r) => Object.assign(r, payload))
    return { data: matched, error: null }
  }
  const builder = {
    eq: (col: keyof Row, value: unknown) => (filters.push((r) => r[col] === value), builder),
    is: (col: keyof Row, value: unknown) => (filters.push((r) => r[col] === value), builder),
    select: () => builder,
    maybeSingle: async () => {
      const { data, error } = run()
      return { data: data?.[0] ?? null, error }
    },
    single: async () => {
      const { data, error } = run()
      return { data: data?.[0] ?? null, error }
    },
    then: (resolve: (v: unknown) => void) => resolve(run()),
  }
  return builder
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => query('select'),
      update: (payload: Partial<Row>) => query('update', payload),
      insert: (payload: Partial<Row>) => query('insert', payload),
    }),
  }),
}))

const { syncClerkUser } = await import('@/lib/auth/sync-user')

const identity = {
  clerkId: 'user_abc',
  email: 'autora@example.com',
  emailVerified: true,
  name: 'Autora',
  image: 'https://img.clerk.com/a.png',
}

describe('syncClerkUser', () => {
  beforeEach(() => {
    rows = []
  })

  it('links a pre-Clerk account with the same verified e-mail (keeps its id)', async () => {
    rows.push({ id: 'legacy-uuid', email: identity.email, name: 'Old', image: null, clerk_id: null })
    await expect(syncClerkUser(identity)).resolves.toBe('legacy-uuid')
    expect(rows).toHaveLength(1)
    expect(rows[0].clerk_id).toBe('user_abc')
  })

  it('does not link by e-mail when the Clerk e-mail is not verified', async () => {
    rows.push({ id: 'legacy-uuid', email: identity.email, name: 'Old', image: null, clerk_id: null })
    await expect(syncClerkUser({ ...identity, emailVerified: false })).rejects.toThrow()
    expect(rows[0].clerk_id).toBeNull()
  })

  it('creates a new row for a brand-new user', async () => {
    const id = await syncClerkUser(identity)
    expect(rows).toEqual([expect.objectContaining({ id, email: identity.email, clerk_id: 'user_abc' })])
  })

  it('returns an already linked user untouched (profile edits are kept)', async () => {
    rows.push({ id: 'linked-uuid', email: identity.email, name: 'Editado no app', image: null, clerk_id: 'user_abc' })
    await expect(syncClerkUser({ ...identity, name: 'Nome do Google' })).resolves.toBe('linked-uuid')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ name: 'Editado no app', image: null })
  })

  it('never re-links an account already linked to another Clerk user', async () => {
    rows.push({ id: 'other-uuid', email: identity.email, name: 'X', image: null, clerk_id: 'user_other' })
    await expect(syncClerkUser(identity)).rejects.toThrow()
    expect(rows[0].clerk_id).toBe('user_other')
  })
})
