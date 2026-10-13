import 'server-only'

import { syncClerkUser } from '@/lib/auth/sync-user'
import { createClient } from '@/lib/supabase/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { cache } from 'react'

export type AppUser = {
  /** `users.id` — the id every table, RLS policy and S3 path uses. */
  id: string
  clerkId: string
  name: string
  email: string
  image: string | null
}

/**
 * The signed-in user as stored in `users`, or null when signed out.
 *
 * Clerk identifies the session (`user_...`); the app keys everything by the
 * `users.id` uuid. `current_user_id()` maps one to the other from the Clerk
 * JWT. If the row is not there yet (first request beat the Clerk webhook),
 * it is created/linked on the spot.
 *
 * Wrapped in `cache` so layouts, pages and tRPC calls in the same RSC render
 * share one lookup.
 */
export const getAppUser = cache(async (): Promise<AppUser | null> => {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  const supabase = await createClient()
  const { data: resolvedId } = await supabase.rpc('current_user_id')
  let id = resolvedId as string | null

  if (!id) {
    const clerkUser = await currentUser()
    if (!clerkUser) return null
    const primaryEmail = clerkUser.primaryEmailAddress
    if (!primaryEmail) return null
    id = await syncClerkUser({
      clerkId,
      email: primaryEmail.emailAddress,
      emailVerified: primaryEmail.verification?.status === 'verified',
      name: clerkUser.fullName ?? primaryEmail.emailAddress.split('@')[0],
      image: clerkUser.imageUrl ?? null,
    })
  }

  const { data: row } = await supabase.from('users').select('id, name, email, image').eq('id', id).maybeSingle()
  if (!row) return null
  return { id: row.id, clerkId, name: row.name, email: row.email, image: row.image }
})
