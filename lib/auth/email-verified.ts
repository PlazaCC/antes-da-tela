import 'server-only'

import { currentUser } from '@clerk/nextjs/server'

/** D10: votes require a verified e-mail (Clerk owns e-mail verification). */
export async function hasVerifiedEmail(): Promise<boolean> {
  const user = await currentUser()
  return user?.primaryEmailAddress?.verification?.status === 'verified'
}
