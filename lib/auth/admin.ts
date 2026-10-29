import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

/** Whether the signed-in user is staff (`admins`, via the is_admin() RPC). */
export const isCurrentUserAdmin = cache(async (): Promise<boolean> => {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('is_admin')
  return !error && data === true
})
