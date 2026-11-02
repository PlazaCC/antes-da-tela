'use client'

import { CallPhaseTag } from '@/components/calls/call-phase-tag'
import { Button } from '@/components/ui/button'
import { CALL_PHASE_LABELS, CALL_PHASES, nextCallPhase, type CallPhase } from '@/lib/constants/calls'

interface CallPhaseControlProps {
  phase: CallPhase
  isSaving: boolean
  onChange: (phase: CallPhase) => void
}

/** A2 — phases change by hand; "advance" is the usual path, the select fixes mistakes. */
export function CallPhaseControl({ phase, isSaving, onChange }: CallPhaseControlProps) {
  const next = nextCallPhase(phase)

  return (
    <div className='flex flex-wrap items-center gap-3'>
      <span className='text-body-small text-text-secondary'>Fase atual:</span>
      <CallPhaseTag phase={phase} />
      {next && (
        <Button type='button' size='sm' disabled={isSaving} onClick={() => onChange(next)}>
          Avançar para “{CALL_PHASE_LABELS[next]}”
        </Button>
      )}
      <select
        aria-label='Definir fase'
        value={phase}
        disabled={isSaving}
        onChange={(e) => onChange(e.target.value as CallPhase)}
        className='h-8 rounded-sm border border-border-subtle bg-elevated px-2 text-xs text-text-secondary'>
        {CALL_PHASES.map((p) => (
          <option key={p} value={p}>
            {CALL_PHASE_LABELS[p]}
          </option>
        ))}
      </select>
    </div>
  )
}
