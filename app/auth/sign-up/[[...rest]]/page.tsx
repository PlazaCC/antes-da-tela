import { AuthPageShell, safeNext } from '@/components/auth/auth-page-shell'
import { SignUp } from '@clerk/nextjs'

type Props = { searchParams: Promise<{ next?: string }> }

export default async function SignUpPage({ searchParams }: Props) {
  const destination = safeNext((await searchParams).next)

  return (
    <AuthPageShell destination={destination}>
      <SignUp
        path="/auth/sign-up"
        signInUrl={`/auth/login?next=${encodeURIComponent(destination)}`}
        fallbackRedirectUrl={destination}
        signInFallbackRedirectUrl={destination}
      />
    </AuthPageShell>
  )
}
