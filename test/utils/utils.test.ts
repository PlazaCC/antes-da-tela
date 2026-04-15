test('cn merges classes and excludes falsy classes', async () => {
  const { cn } = await import('../../lib/utils')
  const result = cn('p-2', 'p-2', 'bg-red-500', { 'text-xs': false, 'text-sm': true })
  expect(typeof result).toBe('string')
  expect(result).toContain('p-2')
  expect(result).toContain('bg-red-500')
  expect(result).toContain('text-sm')
  expect(result).not.toContain('text-xs')
})

test('hasEnvVars toggles based on environment variables', async () => {
  // ensure fresh module load
  vi.resetModules()
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const mod1 = await import('../../lib/utils')
  expect(mod1.hasEnvVars).toBeFalsy()

  // set env and re-import
  vi.resetModules()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.com'
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'pub_key'
  const mod2 = await import('../../lib/utils')
  expect(mod2.hasEnvVars).toBeTruthy()

  // cleanup
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  vi.resetModules()
})
