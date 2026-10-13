import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

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
 *   3. Otherwise → insert a new row.
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
