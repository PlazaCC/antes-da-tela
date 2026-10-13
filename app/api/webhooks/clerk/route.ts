import { syncClerkUser } from '@/lib/auth/sync-user'
import { getPostHogClient } from '@/lib/posthog-server'
import { captureException } from '@/lib/sentry'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserJSON } from '@clerk/nextjs/server'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { after, NextResponse, type NextRequest } from 'next/server'

/**
 * Clerk webhook (configure in Clerk Dashboard → Webhooks, events `user.*` and
 * `session.created`). Signature verified with CLERK_WEBHOOK_SIGNING_SECRET.
 *
 *   user.created / user.updated → create or link (by verified e-mail) the `users` row
 *   user.deleted                → mark the `users` row as deactivated (data kept)
 *   session.created             → PostHog `user_signed_in`
 */
export async function POST(request: NextRequest) {
  let event
  try {
    event = await verifyWebhook(request)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        await syncClerkUser(toIdentity(event.data))
        break
      case 'user.deleted':
        if (event.data.id) {
          await createAdminClient()
            .from('users')
            .update({ deactivated_at: new Date().toISOString() })
            .eq('clerk_id', event.data.id)
        }
        break
      case 'session.created':
        trackSignIn(event.data.user_id)
        break
    }
  } catch (err) {
    captureException(err, { clerkEvent: event.type })
    // 500 → Clerk retries the delivery.
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

function toIdentity(user: UserJSON) {
  const primary = user.email_addresses.find((e) => e.id === user.primary_email_address_id) ?? user.email_addresses[0]
  if (!primary) throw new Error(`Clerk user ${user.id} has no e-mail address`)
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ')
  return {
    clerkId: user.id,
    email: primary.email_address,
    emailVerified: primary.verification?.status === 'verified',
    name: fullName || primary.email_address.split('@')[0],
    image: user.has_image ? user.image_url : null,
  }
}

function trackSignIn(clerkId: string) {
  // After the response: a slow PostHog never delays or fails the webhook.
  after(async () => {
    const { data: user } = await createAdminClient()
      .from('users')
      .select('id, created_at')
      .eq('clerk_id', clerkId)
      .maybeSingle()
    if (!user) return
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: user.id,
      event: 'user_signed_in',
      properties: {
        provider: 'clerk',
        is_new_user: new Date(user.created_at).getTime() > Date.now() - 60_000,
      },
    })
    await posthog.shutdown()
  })
}
