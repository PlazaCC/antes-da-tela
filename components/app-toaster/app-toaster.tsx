'use client'

import { Toaster } from '@/components/ui/sonner'

/**
 * App-level toast container. Wraps the shadcn Sonner Toaster with project
 * defaults (position, duration). Mount once in the root layout.
 *
 * Do not edit `components/ui/sonner.tsx` directly — it is managed by the
 * shadcn CLI. Customise appearance here via Toaster props.
 */
export function AppToaster() {
  return <Toaster position='bottom-right' />
}
