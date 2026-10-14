import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getAppUser, type AppUser } from '@/lib/auth/app-user'
import { captureException } from '@/lib/sentry'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { NavLinks } from './nav-links'
import { NavBarMobileControls } from './navbar-mobile-controls'
import { NavBarSearch } from './navbar-search'
import { UserMenu } from './user-menu'

export function NavBar() {
  return (
    <header
      aria-label="Principal"
      className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md transition-all duration-300 md:h-16"
    >
      <div className="flex h-full items-center justify-between gap-1 px-3 py-2 md:px-4 md:py-0">
        {/* Left: Logo + Nav links */}
        <div className="flex items-center gap-4 md:gap-10">
          <Link href="/feed" className="shrink-0">
            <Image
              src="/logo-white.svg"
              alt="Antes da Tela"
              className="h-9 w-auto max-w-full md:h-10"
              width={475}
              height={87}
              priority
            />
          </Link>
          <NavLinks />
        </div>

        {/* Right: Search container + Profile */}
        <Suspense
          fallback={
            <div className="flex items-center gap-8">
              <div className="hidden items-center gap-2.5 md:flex">
                <Skeleton className="h-8 w-[352px] bg-elevated" />
                <Skeleton className="h-8 w-[120px] bg-elevated" />
              </div>
              <Skeleton className="h-7 w-7 rounded bg-elevated md:hidden" />
              <Skeleton className="h-7 w-7 rounded bg-elevated" />
            </div>
          }
        >
          <NavBarRightSection />
        </Suspense>
      </div>
    </header>
  )
}

async function NavBarRightSection() {
  let user: AppUser | null = null
  try {
    user = await getAppUser()
  } catch (err) {
    // Auth check failed — show login view as fallback, but keep the error visible
    captureException(err, { where: 'NavBarRightSection' })
  }

  if (!user) {
    const pathname = (await headers()).get('x-pathname') ?? '/'
    const loginHref = pathname.startsWith('/auth') ? '/auth/login' : `/auth/login?next=${encodeURIComponent(pathname)}`
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="hidden w-[352px] md:block">
          <Suspense>
            <NavBarSearch />
          </Suspense>
        </div>
        <NavBarMobileControls />
        <Button asChild variant="outline" className="h-8 rounded-sm border-subtle bg-elevated px-4 text-sm text-primary hover:bg-surface">
          <Link href={loginHref}>Login</Link>
        </Button>
      </div>
    )
  }

  const userId = user.id
  const userName = user.name
  const userImage = user.image

  return (
    <div className="flex items-center justify-between gap-4 md:gap-8">
      {/* Desktop: search input + CTA */}
      <div className="hidden w-full items-center gap-2.5 md:flex">
        <div className="w-full max-w-[352px]">
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
