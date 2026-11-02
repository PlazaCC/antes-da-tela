import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { getAppUser } from '@/lib/auth/app-user'
import { safeOnboardingNext } from '@/lib/onboarding/steps'
import { HydrateClient, getQueryClient, trpc } from '@/trpc/server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Boas-vindas',
  robots: { index: false },
}

type Props = { searchParams: Promise<{ next?: string }> }

/**
 * First-login onboarding (RFC-006). Signed-in users without a completed
 * onboarding are sent here by `redirectToOnboardingIfNeeded`; it can also be
 * reopened later, it just runs again.
 */
export default async function OnboardingPage({ searchParams }: Props) {
  const next = safeOnboardingNext((await searchParams).next)
  const user = await getAppUser()
  if (!user) redirect(`/auth/login?next=${encodeURIComponent(`/onboarding?next=${next}`)}`)

  const queryClient = getQueryClient()
  await Promise.all([
    queryClient.prefetchQuery(trpc.onboarding.getState.queryOptions()),
    queryClient.prefetchQuery(trpc.users.getProfile.queryOptions({ id: user.id })),
  ])

  return (
    <HydrateClient>
      <OnboardingWizard userId={user.id} next={next} />
    </HydrateClient>
  )
}
