import { describe, expect, it, vi } from 'vitest'

// Must be defined before the route module is imported so the mock is in place
// when the module is evaluated.
vi.mock('@/lib/supabase/server', () => ({
  createRouteHandlerClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: vi.fn(async () => ({
        data: {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' },
          },
        },
        error: null,
      })),
    },
    from: vi.fn(() => ({
      // upsert returns a thenable so the fire-and-forget .then() in the handler works
      upsert: vi.fn(() =>
        Promise.resolve({ error: null }).then((res) => ({
          ...res,
          // Mimic the PostgrestBuilder shape minimally
          error: null,
        })),
      ),
    })),
  })),
}))

vi.mock('@/lib/sentry', () => ({
  captureException: vi.fn(() => 'mock-event-id'),
}))

import { handler } from '@/app/auth/callback/route'

describe('OAuth callback route', () => {
  it('redirects to the next path on successful code exchange', async () => {
    const req = new Request('https://example.test/auth/callback?code=abc123&next=/dashboard')
    const res = await handler(req)
    expect(res).toBeDefined()
    expect(res.headers.get('location')).toContain('/dashboard')
  })

  it('redirects to / when next param is missing', async () => {
    const req = new Request('https://example.test/auth/callback?code=abc123')
    const res = await handler(req)
    expect(res.headers.get('location')).toMatch(/\/$/)
  })

  it('redirects to error page when code param is missing', async () => {
    const req = new Request('https://example.test/auth/callback')
    const res = await handler(req)
    expect(res.headers.get('location')).toContain('/auth/error')
  })

  it('redirects to error page when OAuth provider returns an error', async () => {
    const req = new Request('https://example.test/auth/callback?error=access_denied')
    const res = await handler(req)
    expect(res.headers.get('location')).toContain('/auth/error')
    expect(res.headers.get('location')).toContain('access_denied')
  })

  it('rejects non-relative next paths to prevent open redirects', async () => {
    const req = new Request(
      'https://example.test/auth/callback?code=abc123&next=https://evil.example.com',
    )
    const res = await handler(req)
    // The handler normalises next to '/' when it does not start with '/'
    expect(res.headers.get('location')).not.toContain('evil.example.com')
  })
})
