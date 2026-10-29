import { Tag, type TagVariant } from '@/components/tag/tag'
import { CALL_PHASE_LABELS, type CallPhase } from '@/lib/constants/calls'

const VARIANTS: Record<CallPhase, TagVariant> = {
  draft: 'rascunho',
  submissions: 'success',
  casting: 'importante',
  curation: 'warning',
  voting: 'importante',
  finished: 'neutro',
}

export function CallPhaseTag({ phase, className }: { phase: CallPhase; className?: string }) {
  return (
    <Tag variant={VARIANTS[phase]} className={className}>
      {CALL_PHASE_LABELS[phase]}
    </Tag>
  )
}
