import { ScriptPageOwnerActions } from '@/components/script-page/script-page-owner-actions'
import { Button } from '@/components/ui/button'
import { ChevronLeft, FileText } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface ScriptPageSubHeaderProps {
  scriptId: string
  title: string
  isOwner: boolean
  hasPitchDeck: boolean
  isDeleting: boolean
  onOpenPitchDeck: () => void
  onDelete: () => void
  /** PDF page/zoom controls rendered alongside the header actions. */
  extra?: ReactNode
}

// Sub-header shell — controlled height; `extra` holds the PDF page/zoom controls.
export function ScriptPageSubHeader({
  scriptId,
  title,
  isOwner,
  hasPitchDeck,
  isDeleting,
  onOpenPitchDeck,
  onDelete,
  extra,
}: ScriptPageSubHeaderProps) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border-subtle bg-bg-base px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/feed"
          className="flex shrink-0 items-center gap-1.5 font-mono text-label-mono-small text-text-muted transition-colors hover:text-text-primary"
        >
          <ChevronLeft className="size-3.5" /> Feed
        </Link>
        <span className="shrink-0 font-mono text-label-mono-small text-text-muted">
          /
        </span>
        <span className="truncate font-mono text-label-mono-small text-text-secondary">
          {title}
        </span>
      </div>
      <div className="hidden h-full shrink-0 items-center gap-3 lg:flex">
        <div className="flex h-full items-center gap-3 border-r border-border-subtle pr-3">
          {hasPitchDeck ? (
            <Button onClick={onOpenPitchDeck} size="xs">
              <FileText />
              <span className="hidden sm:inline">Pitch Deck</span>
            </Button>
          ) : null}
          {isOwner ? (
            <ScriptPageOwnerActions
              scriptId={scriptId}
              onDelete={onDelete}
              disabled={isDeleting}
            />
          ) : null}
        </div>
        {extra}
      </div>
    </div>
  )
}
