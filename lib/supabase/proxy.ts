import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/publicar', '/minha-conta']

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SERVICE_ROLE_KEY) {
    // Missing service key — log and continue without proxying session
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY in updateSession')
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
      SERVICE_ROLE_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Don't mutate the incoming request cookies; set on the response instead
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isProtected = PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route))

    if (isProtected && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      // Use `next` as the canonical redirect query param
      url.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  } catch (err) {
    // Do not block the request on proxy failures; log and continue.
    console.error('updateSession failed', err)
  }

  return supabaseResponse
}
