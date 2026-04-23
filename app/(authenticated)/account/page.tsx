'use client'

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
        <div className='bg-surface border border-border-default rounded-sm p-12 flex flex-col items-center justify-center gap-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent'></div>
          <p className='font-mono text-label-mono-caps text-text-muted'>Carregando perfil...</p>
        </div>
      </main>
    )
  }

  return (
    <main className='max-w-sm mx-auto px-5 py-12 flex flex-col gap-8'>
      <h1 className='font-display text-heading-2 text-primary'>Minha Conta</h1>

      {/* Avatar */}
      <section className='flex flex-col gap-3'>
        <label className='font-mono text-secondary uppercase tracking-wider text-xs'>Avatar</label>
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

      {/* Profile form */}
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
        <div className='flex flex-col gap-2'>
          <label className='font-mono text-secondary uppercase tracking-wider text-xs'>Nome</label>
          <Input {...register('name')} placeholder='Seu nome' />
          {errors.name && <p className='text-state-error text-xs font-mono'>{errors.name.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <label className='font-mono text-secondary uppercase tracking-wider text-xs'>Bio</label>
          <Input {...register('bio')} placeholder='Uma bio curta (opcional)' />
          {errors.bio && <p className='text-state-error text-xs font-mono'>{errors.bio.message}</p>}
        </div>

        <Button type='submit' disabled={isSubmitting || isPending}>
          {isPending ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </form>
    </main>
  )
}
