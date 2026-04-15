import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Development | Next.js Supabase Starter',
  description: 'Developer-only validation pages for integrations and UI primitives.',
}

export default function DevelopmentLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== 'development') {
    redirect('/')
  }

  return (
    <main className='min-h-screen bg-background text-foreground'>
      <div className='w-full max-w-6xl mx-auto px-5 py-8'>
        <div className='mb-8 flex flex-col gap-4 rounded-3xl border border-muted/50 bg-muted/40 p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-2'>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='text-3xl font-semibold'>Development Dashboard</h1>
              <Badge variant='secondary'>DEV ONLY</Badge>
            </div>
            <p className='max-w-2xl text-sm text-muted-foreground'>
              Internal validation pages for integrations and UI components. This route is only available in the local
              development environment.
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button asChild variant='outline' size='sm'>
              <Link href='/development'>Overview</Link>
            </Button>
            <Button asChild variant='outline' size='sm'>
              <Link href='/development/design-system'>Design System</Link>
            </Button>
            <Button asChild variant='outline' size='sm'>
              <Link href='/development/integrations'>Integrations</Link>
            </Button>
            <Button asChild variant='outline' size='sm'>
              <Link href='/development/components'>Components</Link>
            </Button>
          </div>
        </div>
        {children}
      </div>
    </main>
  )
}
