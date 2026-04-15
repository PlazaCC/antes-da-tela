import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DevelopmentPage() {
  return (
    <div className='grid gap-6'>
      <section className='grid gap-4'>
        <div className='space-y-2'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-semibold'>Development tools</h2>
            <Badge variant='secondary'>Local dev only</Badge>
          </div>
          <p className='max-w-3xl text-sm text-muted-foreground'>
            Use these pages to validate the app’s service integrations and to preview UI component behavior before
            shipping.
          </p>
        </div>
      </section>

      <div className='grid gap-4 sm:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Integration checks</CardTitle>
            <CardDescription>Verify Sentry, Resend, PostHog, and Datadog.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <p className='text-sm text-muted-foreground'>
              Run live validation flows for the observability and email integrations already wired into the project.
            </p>
            <Button asChild>
              <Link href='/development/integrations'>Open integrations</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Component playground</CardTitle>
            <CardDescription>Interactive shadcn UI validation.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <p className='text-sm text-muted-foreground'>
              Review buttons, forms, dialogs, menus and tab styles using the app’s own UI primitives.
            </p>
            <Button asChild variant='outline'>
              <Link href='/development/components'>Open playground</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Design system</CardTitle>
            <CardDescription>Showcase tokens, typography and component inventory.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <p className='text-sm text-muted-foreground'>
              Validate the Figma-derived design system in a dedicated developer preview.
            </p>
            <Button asChild variant='outline'>
              <Link href='/development/design-system'>Open design system</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
