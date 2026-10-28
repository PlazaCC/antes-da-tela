import 'server-only'

import type { AppUser } from '@/lib/auth/app-user'
import { createClient } from '@/lib/supabase/server'
import * as Sentry from '@sentry/nextjs'
import { redirect } from 'next/navigation'
import { cache } from 'react'

/**
 * Whether the signed-in user still has to go through the first-login
 * onboarding (RFC-006 §5.2). Every account — new or pre-existing — starts
 * without a `user_onboarding.completed_at`.
 *
 * Fails open: if the lookup errors (e.g. the migration is not applied yet) the
 * user is let through instead of being locked out of the app.
 */
export const needsOnboarding = cache(async (userId: string): Promise<boolean> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_onboarding')
    .select('completed_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    Sentry.captureException(error)
    return false
  }
  return !data?.completed_at
})

/** Sends a user who has not finished the onboarding there, coming back to `pathname` after. */
export async function redirectToOnboardingIfNeeded(user: AppUser | null, pathname: string): Promise<void> {
  if (!user || pathname.startsWith('/onboarding')) return
  if (await needsOnboarding(user.id)) {
    redirect(`/onboarding?next=${encodeURIComponent(pathname)}`)
  }
}
