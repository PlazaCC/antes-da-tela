import { StepActions } from '@/components/onboarding/step-actions'

interface InterpreterStepProps {
  onContinue: () => void
}

/**
 * O4 — interpreter registration. Placeholder until RFC-006 phase 2 (modalities,
 * 30s video/audio, curation) replaces it; the intent is already saved.
 */
export function InterpreterStep({ onContinue }: InterpreterStepProps) {
  return (
    <div className='flex flex-col gap-6'>
      <div className='rounded-sm border border-border-subtle bg-elevated p-5 flex flex-col gap-3 text-body-small text-text-secondary'>
        <p>Para participar dos castings dos editais, você vai:</p>
        <ul className='list-disc pl-5 flex flex-col gap-1'>
          <li>escolher se quer atuar, narrar ou os dois;</li>
          <li>enviar um vídeo (atuação) ou áudio (narração) de até 30 segundos;</li>
          <li>passar pela curadoria da equipe do Antes da Tela.</li>
        </ul>
        <p className='text-text-primary'>O cadastro de intérprete abre em breve — avisaremos você por e-mail.</p>
      </div>
      <StepActions primaryLabel='Continuar' onPrimary={onContinue} />
    </div>
  )
}
