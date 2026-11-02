import { test as teardown } from '@playwright/test'
import { adminDb, cleanup } from './support/db'
import { assertDevEnvironment } from './support/env'

teardown('limpa os editais de teste', async () => {
  assertDevEnvironment()
  await cleanup(adminDb())
})
