import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { clerkClient } from '@clerk/nextjs/server'
import { isClerkAPIResponseError } from '@clerk/nextjs/errors'

export type ClerkIdentity = {
  clerkId: string
  email: string
  emailVerified: boolean
  name: string
  image: string | null
}

/**
 * Ensures a `users` row exists for a Clerk user and returns its `users.id`.
 *
 * Order of resolution:
 *   1. Row already linked (`clerk_id` matches) → nothing to do. Name and
 *      avatar are edited in the app profile, so Clerk never overwrites them.
 *   2. Pre-Clerk account with the same *verified* e-mail and no `clerk_id`
 *      → link it, so existing scripts/comments/ratings are kept.
 *   3. Same *verified* e-mail linked to a `clerk_id` that does not exist in
 *      this Clerk instance (e.g. a dev-instance login against the production
 *      DB) → re-link it to this instance.
 *   4. Otherwise → insert a new row.
 *
 * Runs with the service role: called from the Clerk webhook and as a fallback
 * the first time an authenticated request arrives before the webhook.
 */
export async function syncClerkUser(identity: ClerkIdentity): Promise<string> {
  const admin = createAdminClient()

  const { data: linked } = await admin.from('users').select('id').eq('clerk_id', identity.clerkId).maybeSingle()
  if (linked) return linked.id

  if (identity.emailVerified) {
    const { data: legacy } = await admin
      .from('users')
      .update({ clerk_id: identity.clerkId })
      .eq('email', identity.email)
      .is('clerk_id', null)
      .select('id')
      .maybeSingle()
    if (legacy) return legacy.id

    const relinked = await relinkStaleClerkId(admin, identity)
    if (relinked) return relinked
  }

  const { data: created, error } = await admin
    .from('users')
    .insert({
      name: identity.name.slice(0, 100),
      image: identity.image,
      email: identity.email,
      clerk_id: identity.clerkId,
    })
    .select('id')
    .single()

  if (error?.code === '23505') {
    // Webhook and request fallback raced: the other one inserted first.
    const { data: raced } = await admin.from('users').select('id').eq('clerk_id', identity.clerkId).maybeSingle()
    if (raced) return raced.id
  }
  if (error || !created) throw new Error(`Failed to sync Clerk user: ${error?.message ?? 'no row returned'}`)
  return created.id
}

/** Re-links the row with this e-mail when its `clerk_id` is unknown to this Clerk instance. */
async function relinkStaleClerkId(
  admin: ReturnType<typeof createAdminClient>,
  identity: ClerkIdentity,
): Promise<string | null> {
  const { data: row } = await admin.from('users').select('id, clerk_id').eq('email', identity.email).maybeSingle()
  if (!row?.clerk_id || row.clerk_id === identity.clerkId) return null
  if (await clerkUserExists(row.clerk_id)) return null

  const { data: relinked } = await admin
    .from('users')
    .update({ clerk_id: identity.clerkId })
    .eq('id', row.id)
    .eq('clerk_id', row.clerk_id)
    .select('id')
    .maybeSingle()
  return relinked?.id ?? null
}

async function clerkUserExists(clerkId: string): Promise<boolean> {
  try {
    const clerk = await clerkClient()
    await clerk.users.getUser(clerkId)
    return true
  } catch (err) {
    if (isClerkAPIResponseError(err) && err.status === 404) return false
    throw err
  }
}
