import { canUseIntegrationChecks } from '@/lib/dev-tools-guard'
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

/**
 * Sends a server-side test error to Sentry and returns its event id, so the
 * delivery can be confirmed (e2e/integrations.spec.ts, /development/integrations).
 */
export async function POST(request: Request) {
  if (!(await canUseIntegrationChecks())) return new NextResponse('Not Found', { status: 404 })
  if (!process.env.SENTRY_DSN) return NextResponse.json({ error: 'SENTRY_DSN não configurado' }, { status: 503 })

  const { marker } = (await request.json().catch(() => ({}))) as { marker?: string }
  const eventId = Sentry.captureException(new Error(`Integration check (server) ${marker ?? ''}`.trim()))
  const flushed = await Sentry.flush(5000)
  return NextResponse.json({ eventId, flushed })
}
