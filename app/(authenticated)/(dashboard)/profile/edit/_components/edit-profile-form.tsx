'use client'

import { Avatar } from '@/components/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAvatarUpload } from '@/lib/hooks/use-avatar-upload'
import { useProfileForm } from '@/lib/hooks/use-profile-form'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className='font-mono text-[11px] font-medium tracking-[0.08em] text-brand-accent uppercase mb-4'>{children}</p>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className='block font-sans text-[11px] font-medium text-text-secondary mb-1.5'>{children}</label>
}

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
    return (
      <div className='bg-surface border border-border-default rounded-sm p-12 flex flex-col items-center justify-center gap-4'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent'></div>
        <p className='font-mono text-label-mono-caps text-text-muted'>Carregando perfil...</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex-1 bg-surface border border-border-default rounded-sm p-5 md:p-8 flex flex-col gap-8 shadow-sm'>
      {/* Section: Photo & identity */}
      <section>
        <SectionLabel>Foto e identidade</SectionLabel>
        <div className='w-full h-px bg-border-default mb-5' />
        <div className='flex items-center gap-5 md:gap-8'>
          <Avatar src={profile?.image} name={profile?.name ?? '?'} size='xl' />
          <div>
            <button
              type='button'
              disabled={isUploading}
              onClick={() => fileRef.current?.click()}
              className='flex items-center px-4 h-8 rounded-sm border border-border-subtle bg-elevated text-text-secondary font-sans text-[12px] hover:border-brand-accent hover:text-text-primary transition-colors disabled:opacity-50'>
              {isUploading ? 'Enviando…' : 'Trocar foto'}
            </button>
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

      {/* Section: Personal data */}
      <section>
        <SectionLabel>Dados pessoais</SectionLabel>
        <div className='w-full h-px bg-border-default mb-5' />
        <div className='flex flex-col gap-5 max-w-[440px]'>
          <div>
            <FieldLabel>Nome de exibição</FieldLabel>
            <Input
              {...register('name')}
              placeholder='Seu nome'
              className='bg-elevated border-border-subtle focus:border-brand-accent transition-colors'
            />
            {errors.name && (
              <p className='mt-1 text-state-error font-mono text-label-mono-small'>{errors.name.message}</p>
            )}
          </div>

          <div>
            <FieldLabel>Bio</FieldLabel>
            <textarea
              {...register('bio')}
              placeholder='Uma bio curta (opcional)'
              rows={3}
              className='w-full rounded-sm border border-border-subtle bg-elevated px-3 py-2 font-sans text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-accent resize-none transition-colors'
            />
            {errors.bio && (
              <p className='mt-1 text-state-error font-mono text-label-mono-small'>{errors.bio.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className='flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2'>
        <Button
          type='submit'
          disabled={isSubmitting || isPending}
          className='w-full md:w-[160px] h-11 bg-brand-accent hover:bg-brand-accent/90 text-text-primary font-sans text-[13px] font-semibold'>
          {isPending ? 'Salvando…' : 'Salvar alterações'}
        </Button>
        <button
          type='button'
          onClick={() => router.back()}
          className='w-full md:w-auto px-4 h-11 border border-border-default rounded-sm text-text-secondary font-sans text-[13px] hover:border-border-subtle transition-colors'>
          Cancelar
        </button>
      </div>
    </form>
  )
}
