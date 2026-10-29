'use client'

import { StepActions } from '@/components/onboarding/step-actions'
import { PreferencesFields } from '@/components/preferences/preferences-fields'
import { LoadingState } from '@/components/shared/loading-state'
import { usePreferencesForm } from '@/lib/hooks/use-preferences-form'

interface PreferencesStepProps {
  onDone: () => void
  onSkip: () => void
}

/** O3 — content-preference survey (also editable in /profile/edit). */
export function PreferencesStep({ onDone, onSkip }: PreferencesStepProps) {
  const { values, toggle, isLoading, isPending, save } = usePreferencesForm({ source: 'onboarding', onSaved: onDone })

  if (isLoading) return <LoadingState label='preferências' />

  return (
    <div className='flex flex-col gap-8'>
      <PreferencesFields values={values} onToggle={toggle} />
      <StepActions primaryLabel={isPending ? 'Salvando…' : 'Continuar'} onPrimary={save} disabled={isPending} onSkip={onSkip} />
    </div>
  )
}
