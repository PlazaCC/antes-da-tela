import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { Resend } from 'resend'

/**
 * Transactional e-mail via Resend. Best effort: never throws, so a mail
 * outage does not fail the operation that triggered it. Skipped (with a
 * warning) when RESEND_API_KEY or RESEND_FROM_EMAIL is not configured.
 */
export async function sendEmail(message: { to: string; subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) {
    console.warn('E-mail not sent: RESEND_API_KEY / RESEND_FROM_EMAIL not configured', message.subject)
    return
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({ from, ...message })
    if (error) Sentry.captureException(error)
  } catch (error) {
    Sentry.captureException(error)
  }
}
