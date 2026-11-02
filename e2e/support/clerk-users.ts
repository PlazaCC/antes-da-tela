import { TEST_USERS, type TestRole } from './users'

const CLERK_API = 'https://api.clerk.com/v1'

async function clerkApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${CLERK_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`, 'Content-Type': 'application/json' },
  })
  if (!response.ok) throw new Error(`Clerk API ${path}: ${response.status} ${await response.text()}`)
  return (await response.json()) as T
}

export type ClerkIds = Record<TestRole, string>

/**
 * Creates the test accounts in the Clerk Development instance when missing
 * (verified e-mail, no password) and returns their Clerk ids.
 */
export async function ensureClerkUsers(): Promise<ClerkIds> {
  const ids: Partial<ClerkIds> = {}
  for (const role of Object.keys(TEST_USERS) as TestRole[]) {
    const { email, name } = TEST_USERS[role]
    const found = await clerkApi<Array<{ id: string }>>(`/users?email_address=${encodeURIComponent(email)}`)
    if (found.length > 0) {
      ids[role] = found[0].id
      continue
    }
    const [firstName, ...rest] = name.split(' ')
    const created = await clerkApi<{ id: string }>('/users', {
      method: 'POST',
      body: JSON.stringify({
        email_address: [email],
        first_name: firstName,
        last_name: rest.join(' '),
        skip_password_requirement: true,
      }),
    })
    ids[role] = created.id
  }
  return ids as ClerkIds
}
