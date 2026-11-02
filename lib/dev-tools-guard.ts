import 'server-only'

import { isCurrentUserAdmin } from '@/lib/auth/admin'
import { isDevToolsEnabled } from '@/lib/dev-tools'

/**
 * Integration-check routes (/api/development/*): only with developer tools on
 * (local dev or EXPOSE_DEVELOPER_ROUTER=1) and only for admins. Anything else
 * gets a 404, so the routes are invisible in production.
 */
export async function canUseIntegrationChecks(): Promise<boolean> {
  return isDevToolsEnabled() && (await isCurrentUserAdmin())
}
