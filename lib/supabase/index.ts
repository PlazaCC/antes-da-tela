/**
 * Supabase client helpers.
 *
 * Both `client.ts` and `server.ts` export `createClient` for their respective
 * runtime.  Import from the specific submodule when you need `createClient`
 * so the caller's intent is explicit:
 *
 *   'use client' components    → import { createClient } from '@/lib/supabase/client'
 *   Server Components/Actions  → import { createClient } from '@/lib/supabase/server'
 *
 * Everything else can be imported from this barrel:
 *
 *   import { createRouteHandlerClient, updateSession } from '@/lib/supabase'
 */
export { createRouteHandlerClient } from './server'
export { updateSession } from './middleware'
