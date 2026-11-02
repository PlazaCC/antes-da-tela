import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

// E2E-only settings first (.env.e2e, gitignored; see .env.e2e.example), then the
// app's own files with the same precedence as the app: .env.local wins over .env.
config({ path: '.env.e2e', quiet: true })
config({ path: '.env.local', quiet: true })
config({ path: '.env', quiet: true })

// `||`, not `??`: the example file leaves E2E_BASE_URL= empty, which dotenv loads as ''.
const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000'

/**
 * End-to-end tests against the DEV environment (Clerk Development + dev
 * Supabase). See e2e/README.md. Never point this at production: the setup
 * refuses to run unless E2E_SUPABASE_URL matches NEXT_PUBLIC_SUPABASE_URL
 * and the Clerk key is a pk_test_ key.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    locale: 'pt-BR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /global\.setup\.ts/, teardown: 'teardown' },
    { name: 'teardown', testMatch: /global\.teardown\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: 'yarn dev', url: baseURL, reuseExistingServer: true, timeout: 180_000 },
})
