import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { NavBarSearch } from './navbar-search'
import { UserMenu } from './user-menu'
import { GoogleAuthButton } from './google-auth-button'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function NavBar() {
  return (
    <header
      aria-label='Principal'
      className='sticky top-0 z-50 bg-surface border-b border-border-subtle h-16'
    >
      <div className='max-w-[1280px] mx-auto px-5 h-full flex items-center'>
        {/* Logo — left anchor */}
        <Link href='/' className='shrink-0'>
          <Image src='/assets/logo.svg' alt='Antes da Tela' width={124} height={28} priority />
        </Link>

        {/* Right section: search + auth pushed to the right */}
        <div className='flex items-center gap-4 ml-auto'>
          <div className='w-56 sm:w-72'>
            <Suspense>
              <NavBarSearch />
            </Suspense>
          </div>

          <Suspense
            fallback={
              <div className='flex items-center gap-3'>
                <Skeleton className='h-8 w-28 bg-elevated' />
                <Skeleton className='h-8 w-8 rounded-full bg-elevated' />
              </div>
            }
          >
            <NavBarUserSection />
          </Suspense>
        </div>
      </div>
    </header>
  )
}

async function NavBarUserSection() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    return (
      <GoogleAuthButton label='Entrar com Google' className='w-auto h-8 px-4 text-sm rounded-sm' />
    )
  }

  const userId = user.sub as string
  const userName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split('@')[0] ??
    null
  const userImage =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null

  return (
    <div className='flex items-center gap-3 shrink-0'>
      <Button asChild size='sm' className='h-8 px-4 text-sm rounded-sm'>
        <Link href='/publish'>Novo Roteiro</Link>
      </Button>
      <UserMenu userId={userId} userName={userName} userImage={userImage} />
    </div>
  )
}
