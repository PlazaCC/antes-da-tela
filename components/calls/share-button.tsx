'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Share2 } from 'lucide-react'
import posthog from 'posthog-js'
import { toast } from 'sonner'

interface ShareButtonProps {
  /** Site-relative path to share, e.g. /editais/frapa-2026/r/<entryId>. */
  path: string
  text: string
  label?: string
  className?: string
}

/** D11 — share a participation: native share sheet on mobile, copy + WhatsApp elsewhere. */
export function ShareButton({ path, text, label = 'Compartilhar', className }: ShareButtonProps) {
  const url = () => new URL(path, window.location.origin).toString()

  async function share() {
    posthog.capture('share_clicked', { path })
    if (navigator.share) {
      try {
        await navigator.share({ text, url: url() })
        return
      } catch {
        // Dismissed or unsupported target: fall back to copying.
      }
    }
    await navigator.clipboard.writeText(`${text} ${url()}`)
    toast.success('Link copiado!')
  }

  function shareOnWhatsApp() {
    posthog.capture('share_clicked', { path, channel: 'whatsapp' })
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url()}`)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Button type='button' variant='outline' onClick={share}>
        <Share2 size={16} /> {label}
      </Button>
      <Button type='button' variant='ghost' onClick={shareOnWhatsApp}>
        WhatsApp
      </Button>
    </div>
  )
}
