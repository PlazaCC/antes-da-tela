'use client'

import { AvatarPicker } from '@/components/profile/avatar-picker'
import { ProfileFields } from '@/components/profile/profile-fields'
import { LoadingState } from '@/components/shared/loading-state'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import { useProfileForm } from '@/lib/hooks/use-profile-form'
import { useRouter } from 'next/navigation'

interface EditProfileFormProps {
  userId: string
}

export function EditProfileForm({ userId }: EditProfileFormProps) {
  const router = useRouter()
  const { profile, isLoadingProfile, form, gender, setGender, isPending, submitProfile } = useProfileForm(userId)

  if (isLoadingProfile) {
    return <LoadingState label='perfil' />
  }

  return (
    <form
      onSubmit={form.handleSubmit(submitProfile)}
      className='flex-1 bg-surface border border-border-default rounded-sm p-5 md:p-8 flex flex-col gap-8 shadow-sm'>
      <section>
        <SectionHeading>Foto e identidade</SectionHeading>
        <div className='w-full h-px bg-border-default mb-5' />
        <AvatarPicker image={profile?.image} name={profile?.name ?? '?'} />
      </section>

      <section>
        <SectionHeading>Dados pessoais</SectionHeading>
        <div className='w-full h-px bg-border-default mb-5' />
        <ProfileFields form={form} gender={gender} onGenderChange={setGender} className='max-w-[440px]' />
      </section>

      <div className='flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2'>
        <Button type='submit' disabled={form.formState.isSubmitting || isPending} className='w-full md:w-[160px] h-11'>
          {isPending ? 'Salvando…' : 'Salvar alterações'}
        </Button>
        <Button type='button' variant='outline' onClick={() => router.back()} className='w-full md:w-auto h-11'>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
