import { clerk, clerkSetup } from '@clerk/testing/playwright'
import { test as setup } from '@playwright/test'
import { ensureClerkUsers } from './support/clerk-users'
import { adminDb, getUserIds, resetAndSeed } from './support/db'
import { assertDevEnvironment } from './support/env'
import { storageStatePath, TEST_USERS, type TestRole } from './support/users'

setup.describe.configure({ mode: 'serial' })

setup('ambiente de dev e usuários de teste', async ({ browser }) => {
  assertDevEnvironment()
  await clerkSetup()
  await ensureClerkUsers()

  // Sign every account in once and keep the session; the first authenticated
  // request also creates its `users` row (getAppUser → syncClerkUser).
  for (const role of Object.keys(TEST_USERS) as TestRole[]) {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/')
    await clerk.signIn({ page, emailAddress: TEST_USERS[role].email })
    await page.goto('/onboarding')
    await page.waitForLoadState('networkidle')
    await context.storageState({ path: storageStatePath(role) })
    await context.close()
  }

  const db = adminDb()
  await resetAndSeed(db, await getUserIds(db))
})
