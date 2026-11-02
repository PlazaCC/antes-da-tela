import { setupClerkTestingToken } from '@clerk/testing/playwright'
import type { Browser, BrowserContext, Page } from '@playwright/test'
import { storageStatePath, type TestRole } from './users'

const openContexts = new Set<BrowserContext>()

/**
 * Closes the pages opened by `pageAs` — call it in `test.beforeEach`, so a
 * failing test's pages stay open for its screenshot. Left open, they keep
 * refreshing Clerk tokens for the rest of the file and the failure snapshot
 * shows the first open page instead of the one that failed.
 */
export async function closePages(): Promise<void> {
  await Promise.all([...openContexts].map((context) => context.close()))
  openContexts.clear()
}

/**
 * A page signed in as `role`. Uploads to S3 (presigned PUTs) are answered
 * locally, so the suite does not depend on the bucket.
 */
export async function pageAs(browser: Browser, role: TestRole): Promise<Page> {
  const context = await browser.newContext({ storageState: storageStatePath(role) })
  openContexts.add(context)
  await setupClerkTestingToken({ context })
  await context.route(/X-Amz-Signature=/, (route) =>
    route.request().method() === 'PUT' ? route.fulfill({ status: 200 }) : route.continue(),
  )
  return context.newPage()
}
