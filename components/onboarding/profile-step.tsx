'use client'

import { StepActions } from '@/components/onboarding/step-actions'
import { AvatarPicker } from '@/components/profile/avatar-picker'
import { ProfileFields } from '@/components/profile/profile-fields'
import { LoadingState } from '@/components/shared/loading-state'
import { useProfileForm } from '@/lib/hooks/use-profile-form'

interface ProfileStepProps {
  userId: string
  onDone: () => void
  onSkip: () => void
}

/** O2 — complete the profile (everything optional except the existing name). */
export function ProfileStep({ userId, onDone, onSkip }: ProfileStepProps) {
  const { profile, isLoadingProfile, form, gender, setGender, isPending, submitProfile } = useProfileForm(userId, {
    onSaved: onDone,
  })

  if (isLoadingProfile) return <LoadingState label='perfil' />

  return (
    <form onSubmit={form.handleSubmit(submitProfile)} className='flex flex-col gap-6'>
      <AvatarPicker image={profile?.image} name={profile?.name ?? '?'} />
      <ProfileFields form={form} gender={gender} onGenderChange={setGender} />
      <StepActions primaryLabel={isPending ? 'Salvando…' : 'Salvar e continuar'} submit disabled={isPending} onSkip={onSkip} skipLabel='Pular esta etapa' />
    </form>
  )
}
