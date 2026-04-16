import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './logout-button'
import { GoogleAuthButton } from './google-auth-button'

export async function AuthButton() {
  const supabase = await createClient()
  // getClaims() is intentional here — this is a display-only component, not a
  // security boundary. The token is always fresh because proxy.ts calls
  // getUser() on every request before this renders. Route protection (the
  // actual security check) lives in app/(authenticated)/layout.tsx via getUser().
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (user) {
    const name =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      user.email?.split('@')[0] ??
      'Usuário'

    return (
      <div className="flex items-center gap-3">
        <span className="text-label-mono-default text-text-secondary hidden sm:block truncate max-w-[160px]">
          {name}
        </span>
        <LogoutButton />
      </div>
    )
  }

  return (
    <GoogleAuthButton
      label="Entrar com Google"
      className="w-auto h-9 px-4 text-sm rounded-sm"
    />
  )
}
