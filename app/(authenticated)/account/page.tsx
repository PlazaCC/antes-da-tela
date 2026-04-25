'use client'

import { LoadingState } from '@/components/shared/loading-state'
import { FormField } from '@/components/shared/form-field'
import { PageShell } from '@/components/shared/page-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAvatarUpload } from '@/lib/hooks/use-avatar-upload'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { useProfileForm } from '@/lib/hooks/use-profile-form'
import Image from 'next/image'
import { useRef } from 'react'

export default function AccountPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const { userId } = useCurrentUser()
  const { upload, isUploading } = useAvatarUpload()
  const {
    profile,
    isLoadingProfile,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    isPending,
    submitProfile,
  } = useProfileForm(userId ?? '')

  const onSubmit = submitProfile

  if (isLoadingProfile) {
    return (
      <main className='max-w-sm mx-auto px-5 py-12'>
        <LoadingState label='perfil' />
      </main>
    )
  }

  return (
    <PageShell title='Minha Conta' className='max-w-sm'>
      <section className='flex flex-col gap-3'>
        <p className='font-mono text-[11px] text-text-secondary uppercase tracking-wider'>Avatar</p>
        <div className='flex items-center gap-4'>
          {profile?.image ? (
            <Image
              src={profile.image}
              alt={profile.name}
              width={80}
              height={80}
              unoptimized
              className='w-20 h-20 rounded-full object-cover border border-subtle'
            />
          ) : (
            <div className='w-20 h-20 rounded-full bg-brand-accent/20 flex items-center justify-center text-2xl font-display text-brand-accent shrink-0'>
              {profile?.name?.[0] ?? '?'}
            </div>
          )}
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isUploading}
            onClick={() => fileRef.current?.click()}>
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
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
        <FormField label='Nome' error={errors.name?.message as string | undefined}>
          <Input {...register('name')} placeholder='Seu nome' />
        </FormField>

        <FormField label='Bio' error={errors.bio?.message as string | undefined}>
          <textarea
            {...register('bio')}
            placeholder='Uma bio curta (opcional)'
            rows={3}
            className='w-full rounded-sm border border-border-subtle bg-elevated px-3 py-2 font-sans text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-accent resize-none transition-colors'
          />
        </FormField>

        <Button type='submit' disabled={isSubmitting || isPending}>
          {isPending ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </form>
    </PageShell>
  )
}
