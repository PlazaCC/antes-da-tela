import { updateSession } from '@/lib/supabase/proxy'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (err) {
    // Do not block the request on session proxy errors; log and continue.
    // Avoid logging secrets.
    console.error('proxy handler error', err)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
