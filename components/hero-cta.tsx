import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { GoogleAuthButton } from './google-auth-button'
import { Button } from './ui/button'

export async function HeroCTA() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    return (
      <Button
        asChild
        className="bg-brand-accent text-text-primary hover:bg-brand-accent/90 h-11 px-6 text-base rounded-sm"
      >
        <Link href="/publish">Publicar roteiro</Link>
      </Button>
    )
  }

  return (
    <GoogleAuthButton
      label="Entrar com Google"
      className="w-auto h-11 px-6 text-base rounded-sm"
    />
  )
}
