'use client'

import { InterpreterForm } from '@/components/interpreter/interpreter-form'
import { InterpreterStatusCard } from '@/components/interpreter/interpreter-status-card'
import { StepActions } from '@/components/onboarding/step-actions'
import { LoadingState } from '@/components/shared/loading-state'
import { Button } from '@/components/ui/button'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'

interface InterpreterStepProps {
  onSubmitted: () => void
  onSkip: () => void
}

/** O4 — interpreter registration; "Fazer depois" skips it (finish in /profile/interpreter). */
export function InterpreterStep({ onSubmitted, onSkip }: InterpreterStepProps) {
  const trpc = useTRPC()
  const { data: profile, isLoading } = useQuery(trpc.interpreters.getMine.queryOptions())

  if (isLoading) return <LoadingState label='cadastro de intérprete' />

  if (profile) {
    return (
      <div className='flex flex-col gap-6'>
        <InterpreterStatusCard profile={profile} />
        <StepActions primaryLabel='Continuar' onPrimary={onSkip} />
      </div>
    )
  }

  return (
    <InterpreterForm
      current={null}
      onSubmitted={onSubmitted}
      secondaryAction={
        <Button type='button' variant='ghost' onClick={onSkip} className='h-10 w-full text-text-muted'>
          Fazer depois
        </Button>
      }
    />
  )
}
