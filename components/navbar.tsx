import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { AuthButton } from '@/components/auth-button'
import { Skeleton } from '@/components/ui/skeleton'

export function NavBar() {
  return (
    <nav aria-label="Principal" className="sticky top-0 z-50 bg-bg-base border-b border-border-subtle h-16">
      <div className="max-w-[1140px] mx-auto px-5 h-full flex items-center justify-between">
        <Link href="/" className="shrink-0">
          <Image src="/assets/logo.svg" alt="Antes da Tela" width={83} height={19} priority />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-text-secondary hover:text-text-primary text-body-default transition-colors">
            Home
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/publish">Publicar</Link>
          </Button>
          <Suspense fallback={<Skeleton className="h-9 w-32 bg-elevated" />}>
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </nav>
  )
}
