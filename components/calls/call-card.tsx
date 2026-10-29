import { CallPhaseTag } from '@/components/calls/call-phase-tag'
import type { CallSummary } from '@/lib/types/calls'
import { cn } from '@/lib/utils'
import Link from 'next/link'

/** E1 — a call in the list. */
export function CallCard({ call, className }: { call: CallSummary; className?: string }) {
  return (
    <Link
      href={`/editais/${call.slug}`}
      className={cn('rounded-sm border border-border-default bg-surface p-5 flex flex-col gap-2 hover:border-text-muted transition-colors', className)}>
      <CallPhaseTag phase={call.phase} className='self-start' />
      <h2 className='font-display text-heading-4 text-text-primary'>{call.title}</h2>
      {call.partner && <p className='text-body-small text-text-secondary'>{call.partner}</p>}
    </Link>
  )
}
