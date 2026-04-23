'use client'

import { Avatar } from '@/components/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAvatarUpload } from '@/lib/hooks/use-avatar-upload'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { cn } from '@/lib/utils'
import { profileSchema, type ProfileFormValues } from '@/lib/validators/profile'
import { useTRPC } from '@/trpc/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className='font-mono text-[11px] font-medium tracking-[0.08em] text-brand-accent uppercase mb-4'>{children}</p>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className='block font-sans text-[11px] font-medium text-text-secondary mb-1.5'>{children}</label>
}

export default function EditProfilePage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const { userId } = useCurrentUser()
  const { upload, isUploading } = useAvatarUpload()

  const profileOpts = trpc.users.getProfile.queryOptions({ id: userId ?? '' })
  const { data: profile } = useQuery({ ...profileOpts, enabled: !!userId })

  const updateProfile = useMutation(trpc.users.updateProfile.mutationOptions())

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    if (profile) {
      reset({ name: profile.name, bio: profile.bio ?? undefined })
    }
  }, [profile, reset])

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(
      { name: values.name, bio: values.bio || null },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: profileOpts.queryKey })
          toast.success('Perfil atualizado.')
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <div className='px-5 md:px-8 py-7'>
      <div className='max-w-[800px]'>
        <h1 className='font-display text-[24px] leading-[1.37] text-text-primary mb-6'>Configurações do perfil</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex-1 bg-surface border border-border-default rounded-sm p-5 md:p-8 flex flex-col gap-8'>
          {/* Section: Photo & identity */}
          <section>
            <SectionLabel>Foto e identidade</SectionLabel>
            <div className='w-full h-px bg-border-default mb-5' />
            <div className='flex items-center gap-5 sm:gap-8'>
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
                <Input {...register('name')} placeholder='Seu nome' className='bg-elevated border-border-subtle' />
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
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2'>
            <Button
              type='submit'
              disabled={isSubmitting || updateProfile.isPending}
              className='w-full sm:w-[160px] h-11 bg-brand-accent hover:bg-brand-accent/90 text-text-primary font-sans text-[13px] font-semibold'>
              {updateProfile.isPending ? 'Salvando…' : 'Salvar alterações'}
            </Button>
            <button
              type='button'
              onClick={() => router.back()}
              className='w-full sm:w-auto px-4 h-11 border border-border-default rounded-sm text-text-secondary font-sans text-[13px] hover:border-border-subtle transition-colors'>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
