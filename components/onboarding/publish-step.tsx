import { StepActions } from '@/components/onboarding/step-actions'

interface PublishStepProps {
  onPublish: () => void
  onSkip: () => void
  disabled: boolean
}

/** O5 — producers: optional invite to publish the first script. */
export function PublishStep({ onPublish, onSkip, disabled }: PublishStepProps) {
  return (
    <div className='flex flex-col gap-6'>
      <p className='text-body-small text-text-secondary'>
        Publique um roteiro para receber leituras e feedback — e inscreva-o nos editais de interpretação.
      </p>
      <StepActions primaryLabel='Publicar roteiro' onPrimary={onPublish} disabled={disabled} onSkip={onSkip} skipLabel='Depois' />
    </div>
  )
}
