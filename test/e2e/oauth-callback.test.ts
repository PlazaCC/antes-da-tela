import { describe, expect, it, vi } from 'vitest'

// Mock Supabase server client used by the callback route
vi.mock('@/lib/supabase/server', () => ({
  createRouteHandlerClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: vi.fn(async () => ({
        data: { user: { id: 'user-1', email: 'test@example.com', user_metadata: { full_name: 'Test User' } } },
        error: null,
      })),
      getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })),
    },
    from: () => ({
      upsert: () => Promise.resolve({ error: null }),
    }),
  })),
}))

import { handler } from '@/app/auth/callback/route'

describe('OAuth callback route', () => {
  it('redirects to the next path on successful exchange', async () => {
    const req = new Request('https://example.test/auth/callback?code=abc123&next=/dashboard')
    const res = await handler(req)
    // expect a redirect response with Location header
    expect(res).toBeDefined()
    const location = res.headers.get('location')
    expect(location).toContain('/dashboard')
  })
})
