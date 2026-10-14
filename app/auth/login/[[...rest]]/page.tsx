import { AuthPageShell, safeNext } from '@/components/auth/auth-page-shell'
import { SignIn } from '@clerk/nextjs'

type Props = { searchParams: Promise<{ next?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const destination = safeNext((await searchParams).next)

  return (
    <AuthPageShell destination={destination}>
      <SignIn
        path="/auth/login"
        signUpUrl={`/auth/sign-up?next=${encodeURIComponent(destination)}`}
        fallbackRedirectUrl={destination}
        signUpFallbackRedirectUrl={destination}
      />
    </AuthPageShell>
  )
}
