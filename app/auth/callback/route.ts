import withErrorHandler from '@/lib/api/withErrorHandler'
import { captureException } from '@/lib/sentry'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * OAuth callback route — receives the authorization code from Supabase's
 * hosted OAuth flow (Google) and exchanges it for a session.
 *
 * Flow:
 *   1. Google redirects to this route with `?code=<code>`.
 *   2. `exchangeCodeForSession` contacts Supabase Auth, gets back access +
 *      refresh tokens, and writes them as HttpOnly cookies via `setAll`.
 *   3. A fire-and-forget upsert keeps the `users` table in sync.
 *   4. The user is redirected to `?next=` (defaults to `/`).
 *
 * Uses `createRouteHandlerClient` (not `createClient`) so that `setAll`
 * errors are NOT swallowed — persisting the session cookie is critical here.
 */
async function handler(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  const supabase = await createRouteHandlerClient()

  try {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError || !data?.user) {
      return NextResponse.redirect(`${origin}/auth/error`)
    }

    const { user } = data

    // Fire-and-forget: keep the users table in sync after first OAuth login.
    // The Supabase client now carries the session JWT, so RLS allows this
    // upsert (auth.uid() === user.id).  We do not await to avoid delaying the
    // redirect.
    supabase
      .from('users')
      .upsert(
        {
          id: user.id,
          name: String(
            user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
          ).slice(0, 100),
          email: user.email!,
          image: user.user_metadata?.avatar_url ?? null,
        },
        { onConflict: 'id' },
      )
      .then(
        (res) => {
          if (res.error) {
            try {
              captureException(res.error, { userId: user.id })
            } catch {
              /* ignore */
            }
            console.error('Failed to upsert user after OAuth exchange', res.error.message)
          }
        },
        (err) => {
          try {
            captureException(err, { userId: user.id })
          } catch {
            /* ignore */
          }
          console.error('Failed to upsert user after OAuth exchange', err)
        },
      )

    const destination = next.startsWith('/') ? next : '/'
    return NextResponse.redirect(`${origin}${destination}`)
  } catch (err) {
    // Report to Sentry and redirect to error page
    try {
      const id = captureException(err)
      // include the Sentry event id so support can correlate logs
      return NextResponse.redirect(`${origin}/auth/error?eventId=${encodeURIComponent(String(id))}`)
    } catch {
      console.error('Error during auth callback handling', err)
      return NextResponse.redirect(`${origin}/auth/error`)
    }
  }
}

export const GET = withErrorHandler(handler)
export { handler }
