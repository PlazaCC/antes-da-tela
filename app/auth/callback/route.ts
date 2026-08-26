import withErrorHandler from '@/lib/api/withErrorHandler'
import { getPostHogClient } from '@/lib/posthog-server'
import { captureException } from '@/lib/sentry'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { after, NextResponse } from 'next/server'

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
  const next = searchParams.get('next') ?? '/feed'
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

    // Track sign-in and identify the user server-side. Scheduled via `after()`
    // so it runs once the redirect response has already been sent — a slow or
    // unreachable PostHog can then never delay the redirect or turn a
    // successful login into an `/auth/error` redirect (posthog-node's
    // `shutdown()` rejects on its internal 30s timeout, which would otherwise
    // be caught by this function's own try/catch below).
    after(async () => {
      const posthog = getPostHogClient()
      const isNewUser = new Date(user.created_at).getTime() > Date.now() - 60_000
      posthog.capture({
        distinctId: user.id,
        event: 'user_signed_in',
        properties: {
          provider: 'google',
          is_new_user: isNewUser,
        },
      })
      posthog.identify({
        distinctId: user.id,
        properties: {
          name: String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User').slice(0, 100),
          email: user.email,
        },
      })
      // posthog-node queues captures for async delivery and does not manage
      // its own lifecycle — without draining here, the events could be lost
      // once the function instance is frozen/recycled.
      await posthog.shutdown()
    })

    const destination = next.startsWith('/') ? next : '/feed'
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
