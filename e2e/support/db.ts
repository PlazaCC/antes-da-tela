import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SEEDED_SCRIPT_TITLE, TEST_USERS, type TestRole } from './users'

/** Service-role client for seeding/cleanup only (dev database, see env.ts). */
export function adminDb(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export type UserIds = Record<TestRole, string>

/** `users.id` of every test account (rows are created on their first visit). */
export async function getUserIds(db: SupabaseClient): Promise<UserIds> {
  const emails = Object.values(TEST_USERS).map((u) => u.email)
  const { data, error } = await db.from('users').select('id, email').in('email', emails)
  if (error) throw error
  const ids = Object.fromEntries(
    (Object.keys(TEST_USERS) as TestRole[]).map((role) => [role, data?.find((row) => row.email === TEST_USERS[role].email)?.id]),
  )
  const missing = Object.entries(ids).filter(([, id]) => !id)
  if (missing.length) throw new Error(`E2E: usuários sem linha em users: ${missing.map(([role]) => role).join(', ')}`)
  return ids as UserIds
}

const check = ({ error }: { error: unknown }) => {
  if (error) throw error
}

/** Removes what previous runs left and puts every account in its starting state. */
export async function resetAndSeed(db: SupabaseClient, ids: UserIds): Promise<void> {
  check(await db.from('calls').delete().like('slug', 'e2e-%'))
  check(await db.from('interpreter_profiles').delete().eq('user_id', ids.interpreter))
  check(await db.from('user_documents').delete().eq('user_id', ids.voter))
  check(await db.from('user_onboarding').delete().eq('user_id', ids.newcomer))
  check(await db.from('user_preferences').delete().eq('user_id', ids.newcomer))

  // Everyone but the newcomer has finished the onboarding.
  const done = new Date().toISOString()
  check(
    await db.from('user_onboarding').upsert(
      (['admin', 'interpreter', 'voter'] as const).map((role) => ({ user_id: ids[role], completed_at: done })),
      { onConflict: 'user_id' },
    ),
  )
  check(await db.from('admins').upsert({ user_id: ids.admin }, { onConflict: 'user_id' }))

  const { data: script } = await db.from('scripts').select('id').eq('author_id', ids.admin).eq('title', SEEDED_SCRIPT_TITLE).maybeSingle()
  if (!script) {
    check(
      await db.from('scripts').insert({
        title: SEEDED_SCRIPT_TITLE,
        logline: 'Roteiro criado pelos testes end-to-end.',
        genre: 'drama',
        status: 'published',
        author_id: ids.admin,
        published_at: done,
      }),
    )
  }
}

/** After the suite: drop the calls it created (cascade: entries, characters, castings, votes). */
export async function cleanup(db: SupabaseClient): Promise<void> {
  check(await db.from('calls').delete().like('slug', 'e2e-%'))
}
