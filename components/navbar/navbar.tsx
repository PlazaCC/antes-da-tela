import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/server'
import { getUserDisplayName } from '@/lib/utils/auth'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { NavLinks } from './nav-links'
import { NavBarMobileControls } from './navbar-mobile-controls'
import { NavBarSearch } from './navbar-search'
import { UserMenu } from './user-menu'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'

export function NavBar() {
  return (
    <header aria-label='Principal' className='sticky top-0 z-50 bg-surface border-b border-border-default md:h-14'>
      <div className='px-4 py-2 md:py-0 h-full flex  justify-between gap-1'>
        {/* Left: Logo + Nav links */}
        <div className='flex items-center gap-10'>
          <Link href='/' className='shrink-0'>
            <Image
              src='/assets/logo.svg'
              alt='Antes da Tela'
              className='max-w-full w-100% h-auto'
              width={196}
              height={24}
              priority
            />
          </Link>
          <NavLinks />
        </div>

        {/* Right: Search container + Profile */}
        <Suspense
          fallback={
            <div className='flex items-center gap-8'>
              <div className='hidden md:flex items-center gap-2.5'>
                <Skeleton className='h-8 w-[352px] bg-elevated' />
                <Skeleton className='h-8 w-[120px] bg-elevated' />
              </div>
              <Skeleton className='h-7 w-7 rounded bg-elevated md:hidden' />
              <Skeleton className='h-7 w-7 rounded bg-elevated' />
            </div>
          }>
          <NavBarRightSection />
        </Suspense>
      </div>
    </header>
  )
}

async function NavBarRightSection() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    return (
      <div className='flex items-center gap-4 justify-between'>
        <div className='hidden md:block w-[352px]'>
          <Suspense>
            <NavBarSearch />
          </Suspense>
        </div>
        <NavBarMobileControls />
        <GoogleAuthButton label='Login' className='w-auto h-8 px-4 text-sm rounded-sm' />
      </div>
    )
  }

  const userId = user.sub as string
  const userName = getUserDisplayName(user)
  const userImage =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null

  return (
    <div className='flex items-center gap-8 justify-between'>
      {/* Desktop: search input + CTA */}
      <div className='hidden md:flex items-center gap-2.5 w-full'>
        <div className='w-full max-w-[352px]'>
          <Suspense>
            <NavBarSearch />
          </Suspense>
        </div>
      </div>

      {/* Mobile: search icon */}
      <NavBarMobileControls />

      {/* Profile container */}
      <UserMenu userId={userId} userName={userName} userImage={userImage} />
    </div>
  )
}
