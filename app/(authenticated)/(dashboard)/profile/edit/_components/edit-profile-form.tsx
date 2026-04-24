'use client'

import { Avatar } from '@/components/avatar'
import { LoadingState } from '@/components/shared/loading-state'
import { FormField } from '@/components/shared/form-field'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAvatarUpload } from '@/lib/hooks/use-avatar-upload'
import { useProfileForm } from '@/lib/hooks/use-profile-form'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

interface EditProfileFormProps {
  userId: string
}

export function EditProfileForm({ userId }: EditProfileFormProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const { upload, isUploading } = useAvatarUpload()
  const {
    profile,
    isLoadingProfile,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    isPending,
    submitProfile,
  } = useProfileForm(userId)

  const onSubmit = submitProfile

  if (isLoadingProfile) {
    return <LoadingState label='perfil' />
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex-1 bg-surface border border-border-default rounded-sm p-5 md:p-8 flex flex-col gap-8 shadow-sm'>
      <section>
        <SectionHeading>Foto e identidade</SectionHeading>
        <div className='w-full h-px bg-border-default mb-5' />
        <div className='flex items-center gap-5 md:gap-8'>
          <Avatar src={profile?.image} name={profile?.name ?? '?'} size='xl' />
          <div>
            <Button
              type='button'
              disabled={isUploading}
              onClick={() => fileRef.current?.click()}
              variant='outline'
              size='sm'>
              {isUploading ? 'Enviando…' : 'Trocar foto'}
            </Button>
            <input
              ref={fileRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void upload(file)
              }}
            />
          </div>
        </div>
      </section>

      <section>
        <SectionHeading>Dados pessoais</SectionHeading>
        <div className='w-full h-px bg-border-default mb-5' />
        <div className='flex flex-col gap-5 max-w-[440px]'>
          <FormField label='Nome de exibição' error={errors.name?.message as string | undefined}>
            <Input
              {...register('name')}
              placeholder='Seu nome'
              className='bg-elevated border-border-subtle focus:border-brand-accent transition-colors'
            />
          </FormField>

          <FormField label='Bio' error={errors.bio?.message as string | undefined}>
            <textarea
              {...register('bio')}
              placeholder='Uma bio curta (opcional)'
              rows={3}
              className='w-full rounded-sm border border-border-subtle bg-elevated px-3 py-2 font-sans text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-accent resize-none transition-colors'
            />
          </FormField>
        </div>
      </section>

      <div className='flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2'>
        <Button type='submit' disabled={isSubmitting || isPending} className='w-full md:w-[160px] h-11'>
          {isPending ? 'Salvando…' : 'Salvar alterações'}
        </Button>
        <Button type='button' variant='outline' onClick={() => router.back()} className='w-full md:w-auto h-11'>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
