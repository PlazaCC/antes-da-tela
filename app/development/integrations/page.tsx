'use client'

import Link from 'next/link'
import posthog from 'posthog-js'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DevelopmentIntegrationsPage() {
  const [email, setEmail] = useState('seu-email@exemplo.com')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null)
  const [isSentryLoading, setIsSentryLoading] = useState(false)
  const [isResendLoading, setIsResendLoading] = useState(false)
  const [isPostHogLoading, setIsPostHogLoading] = useState(false)

  function showFeedback(title: string, message: string) {
    setFeedback({ title, message })
    setDialogOpen(true)
  }

  async function triggerSentry() {
    setIsSentryLoading(true)

    try {
      const response = await fetch('/api/sentry-example-api')
      if (!response.ok) {
        showFeedback('Sentry', 'Sentry error was triggered and sent to monitoring.')
        return
      }
      showFeedback('Sentry', 'Unexpected Sentry endpoint success.')
    } catch {
      showFeedback('Sentry', 'Sentry request failed as expected.')
    } finally {
      setIsSentryLoading(false)
    }
  }

  async function triggerResend() {
    setIsResendLoading(true)

    try {
      const response = await fetch('/api/test-resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email }),
      })
      const body = await response.json()
      if (!response.ok) {
        showFeedback('Resend', `Resend failed: ${body.error ?? response.statusText}`)
        return
      }
      showFeedback('Resend', 'Test email request sent. Check your Resend dashboard.')
    } catch (error) {
      showFeedback('Resend', `Resend request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsResendLoading(false)
    }
  }

  function triggerPostHog() {
    setIsPostHogLoading(true)

    try {
      posthog.capture('dev_integrations_posthog_test', {
        page: '/development/integrations',
      })
      showFeedback('PostHog', 'PostHog event dispatched. Check the analytics dashboard.')
    } catch (error) {
      showFeedback('PostHog', `PostHog capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsPostHogLoading(false)
    }
  }

  return (
    <div className='grid gap-6'>
      <section className='grid gap-4'>
        <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <h2 className='text-2xl font-semibold'>Integration Validation</h2>
              <Badge variant='secondary'>Live checks</Badge>
            </div>
            <p className='max-w-3xl text-sm text-muted-foreground'>
              Trigger observability and email flows to confirm the application’s current environment setup.
            </p>
          </div>
          <Button asChild variant='outline' size='sm'>
            <Link href='/development'>Back to dashboard</Link>
          </Button>
        </div>
      </section>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Sentry</CardTitle>
            <CardDescription>Trigger a server-side error and verify it in Sentry.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              The endpoint will raise a handled exception and send it to Sentry.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={triggerSentry} disabled={isSentryLoading}>
              {isSentryLoading ? 'Running...' : 'Trigger Sentry'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resend</CardTitle>
            <CardDescription>Send a test email through the existing Resend API route.</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-3'>
            <div className='grid gap-2'>
              <Label htmlFor='resend-email'>Test email</Label>
              <Input id='resend-email' value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <p className='text-sm text-muted-foreground'>
              The current API route only allows the configured test address.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={triggerResend} disabled={isResendLoading}>
              {isResendLoading ? 'Sending...' : 'Send email'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PostHog</CardTitle>
            <CardDescription>Capture a client-side analytics event.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Send a sample PostHog event and verify it in the PostHog dashboard.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={triggerPostHog} disabled={isPostHogLoading}>
              {isPostHogLoading ? 'Sending...' : 'Send PostHog event'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false)
            setFeedback(null)
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{feedback?.title ?? 'Result'}</DialogTitle>
          </DialogHeader>
          <DialogDescription>{feedback?.message ?? 'Action completed.'}</DialogDescription>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  )
}
