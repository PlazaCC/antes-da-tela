import { CALL_PHASE_LABELS, PUBLIC_CALL_PHASES, type CallPhase } from '@/lib/constants/calls'
import type { CallSummary } from '@/lib/types/calls'
import { cn } from '@/lib/utils'
import { formatShortDate } from '@/lib/utils/format-date'

function phaseDate(call: CallSummary, phase: CallPhase): string | null {
  switch (phase) {
    case 'submissions':
      return call.submissionsEndAt ? `até ${formatShortDate(call.submissionsEndAt)}` : null
    case 'casting':
      return call.castingEndAt ? `até ${formatShortDate(call.castingEndAt)}` : null
    case 'voting':
      if (!call.votingStartAt) return null
      return `${formatShortDate(call.votingStartAt)}${call.votingEndAt ? ` – ${formatShortDate(call.votingEndAt)}` : ''}`
    default:
      return null
  }
}

/** E2 — the call's phases, current one highlighted. */
export function CallTimeline({ call, className }: { call: CallSummary; className?: string }) {
  const currentIndex = PUBLIC_CALL_PHASES.indexOf(call.phase)

  return (
    <ol className={cn('flex flex-col gap-3', className)}>
      {PUBLIC_CALL_PHASES.map((phase, index) => {
        const date = phaseDate(call, phase)
        return (
          <li key={phase} className='flex items-center gap-3'>
            <span className={cn('h-3 w-3 rounded-full shrink-0', index <= currentIndex ? 'bg-brand-accent' : 'bg-elevated border border-border-subtle')} />
            <span className={cn('text-body-small', index === currentIndex ? 'text-text-primary font-semibold' : 'text-text-secondary')}>
              {CALL_PHASE_LABELS[phase]}
              {date && <span className='text-text-muted font-normal'> · {date}</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
