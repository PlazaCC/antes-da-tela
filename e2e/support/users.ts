/**
 * Test accounts, created on demand in the Clerk Development instance.
 * `+clerk_test` addresses never receive real e-mail.
 */
export const TEST_USERS = {
  admin: { email: 'e2e-admin+clerk_test@example.com', name: 'E2E Admin' },
  interpreter: { email: 'e2e-interprete+clerk_test@example.com', name: 'E2E Intérprete' },
  voter: { email: 'e2e-eleitor+clerk_test@example.com', name: 'E2E Eleitor' },
  newcomer: { email: 'e2e-novato+clerk_test@example.com', name: 'E2E Novato' },
} as const

export type TestRole = keyof typeof TEST_USERS

export const storageStatePath = (role: TestRole) => `e2e/.auth/${role}.json`

/** The admin is also the author of the seeded script. */
export const SEEDED_SCRIPT_TITLE = 'E2E — Roteiro de teste'
