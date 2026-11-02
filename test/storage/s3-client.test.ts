import { afterEach, describe, expect, it, vi } from 'vitest'

describe('s3-client', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('imports without AWS env (the build no longer needs it)', async () => {
    vi.stubEnv('AWS_REGION', '')
    await expect(import('@/lib/storage/s3-client')).resolves.toBeDefined()
  })

  it('fails only when the client is used without a region', async () => {
    vi.stubEnv('AWS_REGION', '')
    const { s3 } = await import('@/lib/storage/s3-client')
    expect(() => s3.config).toThrow('AWS_REGION is not configured')
  })

  it('creates the client lazily with the configured region', async () => {
    vi.stubEnv('AWS_REGION', 'sa-east-1')
    const { s3 } = await import('@/lib/storage/s3-client')
    await expect(s3.config.region()).resolves.toBe('sa-east-1')
  })
})
