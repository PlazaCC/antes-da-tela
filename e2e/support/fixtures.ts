import { setupClerkTestingToken } from '@clerk/testing/playwright'
import type { Browser, Page } from '@playwright/test'
import { storageStatePath, type TestRole } from './users'

/**
 * A page signed in as `role`. Uploads to S3 (presigned PUTs) are answered
 * locally, so the suite does not depend on the bucket.
 */
export async function pageAs(browser: Browser, role: TestRole): Promise<Page> {
  const context = await browser.newContext({ storageState: storageStatePath(role) })
  await setupClerkTestingToken({ context })
  await context.route(/X-Amz-Signature=/, (route) =>
    route.request().method() === 'PUT' ? route.fulfill({ status: 200 }) : route.continue(),
  )
  return context.newPage()
}
