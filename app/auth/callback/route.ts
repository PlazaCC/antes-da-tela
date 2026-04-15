import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

  const cookieStore = await cookies()

  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SERVICE_ROLE_KEY) {
    // Fail fast on server if service role key is not configured
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY in server environment')
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  const supabase = createServerClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  try {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError || !data?.user) {
      return NextResponse.redirect(`${origin}/auth/error`)
    }

    const { user } = data

    // Use the Supabase client (PostgREST) instead of Drizzle.
    // After exchangeCodeForSession the client carries the session, so auth.uid() = user.id
    // and the RLS policy "Users can view and update their own data" allows this insert.
    try {
      const upsertPayload = {
        id: user.id,
        name: String(
          user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
        ).slice(0, 100),
        email: user.email!,
        image: user.user_metadata?.avatar_url ?? null,
      }

      // Fire-and-forget the upsert to avoid delaying the user redirect.
      // Log any failure asynchronously without blocking the response.
      supabase
        .from('users')
        .upsert(upsertPayload, { onConflict: 'id' })
        .then(
          (res) => {
            const upsertError = res.error
            if (upsertError) {
              console.error('Failed to upsert user after OAuth exchange', upsertError.message ?? upsertError)
            }
          },
          (err) => {
            console.error('Failed to upsert user after OAuth exchange', err)
          },
        )
      // continue without awaiting
    } catch (err) {
      console.error('Failed to initiate user upsert after OAuth exchange', err)
    }

    const destination = next.startsWith('/') ? next : '/'
    return NextResponse.redirect(`${origin}${destination}`)
  } catch (err) {
    console.error('Error during auth callback handling', err)
    return NextResponse.redirect(`${origin}/auth/error`)
  }
}
