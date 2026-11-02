import { MediaPlayer } from '@/components/interpreter/media-player'
import { Tag, type TagVariant } from '@/components/tag/tag'
import { MODALITY_LABELS } from '@/lib/constants/interpreters'
import type { InterpreterProfile, ReviewStatus } from '@/lib/types/interpreters'
import { cn } from '@/lib/utils'

const STATUS: Record<ReviewStatus, { label: string; variant: TagVariant; description: string }> = {
  pending: { label: 'Em curadoria', variant: 'warning', description: 'Nossa equipe vai avaliar seu material. Você recebe um e-mail com o resultado.' },
  approved: { label: 'Aprovado', variant: 'success', description: 'Você já pode participar dos castings dos editais.' },
  rejected: { label: 'Não aprovado', variant: 'error', description: 'Você pode ajustar e enviar um novo material abaixo.' },
}

interface InterpreterStatusCardProps {
  profile: InterpreterProfile
  className?: string
}

/** P3 — registration status, modalities and the current presentation. */
export function InterpreterStatusCard({ profile, className }: InterpreterStatusCardProps) {
  const status = STATUS[profile.status]

  return (
    <section className={cn('rounded-sm border border-border-default bg-surface p-5 flex flex-col gap-4', className)}>
      <div className='flex flex-wrap items-center gap-2'>
        <Tag variant={status.variant}>{status.label}</Tag>
        {profile.modalities.map((m) => (
          <Tag key={m} variant='neutro'>
            {MODALITY_LABELS[m]}
          </Tag>
        ))}
      </div>
      <p className='text-body-small text-text-secondary'>{status.description}</p>
      {profile.status === 'rejected' && profile.rejectionReason && (
        <p className='text-body-small text-text-primary'>Motivo: {profile.rejectionReason}</p>
      )}
      <MediaPlayer src={profile.mediaUrl} kind={profile.mediaType} />
    </section>
  )
}
