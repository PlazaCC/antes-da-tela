import Link from 'next/link'
import { Button } from './ui/button'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './logout-button'

export async function AuthButton() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (user) {
    const name =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split('@')[0] ??
      'Usuário'

    return (
      <div className="flex items-center gap-4">
        <span className="text-body-small text-secondary">{name}</span>
        <LogoutButton />
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">Entrar</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/auth/sign-up">Cadastrar</Link>
      </Button>
    </div>
  )
}
