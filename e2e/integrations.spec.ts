import { expect, test } from '@playwright/test'
import { pageAs } from './support/fixtures'

/**
 * The app's external services in the current environment: errors reach
 * Sentry (browser and server), analytics reach PostHog, e-mail goes out through
 * Resend. Each check skips with a clear reason when its service isn't
 * configured; the optional E2E_* keys add confirmation on the provider's side.
 */
const marker = `e2e-${Date.now()}`

async function poll<T>(fn: () => Promise<T | null>, timeoutMs = 45_000): Promise<T | null> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const value = await fn()
    if (value) return value
    await new Promise((resolve) => setTimeout(resolve, 3_000))
  }
  return null
}

test.describe('integrações', () => {
  test('Sentry recebe erro do navegador', async ({ browser }) => {
    test.skip(!process.env.NEXT_PUBLIC_SENTRY_DSN, 'NEXT_PUBLIC_SENTRY_DSN não configurado')
    const page = await pageAs(browser, 'admin')
    await page.goto('/editais')

    const envelope = page.waitForResponse(
      (response) => /\/api\/\d+\/envelope\//.test(response.url()) && (response.request().postData() ?? '').includes(marker),
    )
    await page.evaluate((message) => setTimeout(() => { throw new Error(message) }, 0), `Integration check (browser) ${marker}`)
    expect((await envelope).status()).toBe(200)
  })

  test('Sentry recebe erro do servidor', async ({ browser }) => {
    test.skip(!process.env.SENTRY_DSN, 'SENTRY_DSN não configurado')
    const page = await pageAs(browser, 'admin')
    const response = await page.request.post('/api/development/sentry', { data: { marker } })
    expect(response.status(), await response.text()).toBe(200)
    const { eventId, flushed } = await response.json()
    expect(eventId).toBeTruthy()
    expect(flushed).toBe(true)

    // Optional: confirm on Sentry's side (token with event:read).
    const token = process.env.E2E_SENTRY_API_TOKEN
    if (!token) return
    const base = process.env.E2E_SENTRY_API_URL ?? 'https://sentry.io'
    const url = `${base}/api/0/projects/${process.env.SENTRY_ORG}/${process.env.SENTRY_PROJECT}/events/${eventId}/`
    const found = await poll(async () => ((await fetch(url, { headers: { Authorization: `Bearer ${token}` } })).ok ? true : null))
    expect(found, `evento ${eventId} não apareceu no Sentry`).toBe(true)
  })

  test('PostHog recebe eventos do navegador', async ({ browser }) => {
    test.skip(!process.env.NEXT_PUBLIC_POSTHOG_TOKEN, 'NEXT_PUBLIC_POSTHOG_TOKEN não configurado')
    const page = await pageAs(browser, 'admin')
    const ingest = page.waitForResponse(
      (response) => response.url().includes('/ingest/') && response.request().method() === 'POST',
      { timeout: 30_000 },
    )
    await page.goto('/editais')
    expect((await ingest).status()).toBe(200)
  })

  test('Resend envia e-mail com o remetente do ambiente', async ({ browser }) => {
    test.skip(!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL, 'RESEND_API_KEY / RESEND_FROM_EMAIL não configurados')
    const page = await pageAs(browser, 'admin')
    const response = await page.request.post('/api/development/email', { data: { marker } })
    expect(response.status(), await response.text()).toBe(200)
    const { id } = await response.json()
    expect(id).toBeTruthy()

    // Optional: confirm delivery on Resend's side (full-access key).
    const key = process.env.E2E_RESEND_API_KEY
    if (!key) return
    const delivered = await poll(async () => {
      const email = await (await fetch(`https://api.resend.com/emails/${id}`, { headers: { Authorization: `Bearer ${key}` } })).json()
      return email.last_event === 'delivered' ? email : null
    })
    expect(delivered, `e-mail ${id} não foi entregue`).toBeTruthy()
  })

  test('rotas de verificação são invisíveis para quem não é admin', async ({ browser }) => {
    const page = await pageAs(browser, 'voter')
    expect((await page.request.post('/api/development/sentry')).status()).toBe(404)
    expect((await page.request.post('/api/development/email')).status()).toBe(404)
  })
})
