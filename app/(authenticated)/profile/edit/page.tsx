'use client'

import { Avatar } from '@/components/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
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

const NAV_ITEMS = [
  { id: 'profile', label: 'Perfil público' },
  { id: 'account', label: 'Conta e segurança' },
  { id: 'notifications', label: 'Notificações' },
  { id: 'privacy', label: 'Privacidade' },
  { id: 'appearance', label: 'Aparência' },
] as const

export default function EditProfilePage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [activeNav, setActiveNav] = useState<string>('profile')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [supabase])

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
      reset({ name: profile.name, bio: profile.bio ?? '' })
    }
  }, [profile, reset])

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(
      { name: values.name, bio: values.bio ?? '' },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: profileOpts.queryKey })
          toast.success('Perfil atualizado.')
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  const handleAvatarUpload = async (file: File) => {
    if (!userId) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'png'
      const path = `${userId}/${Date.now()}_avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      if (!urlData?.publicUrl) throw new Error('Unable to generate avatar URL.')
      updateProfile.mutate(
        { image: urlData.publicUrl },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: profileOpts.queryKey })
            toast.success('Avatar atualizado.')
          },
          onError: (err) => toast.error(err.message),
        },
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className='min-h-screen bg-bg-base'>
      <div className='max-w-[1280px] mx-auto px-10 py-8'>
        <h1 className='font-display text-[24px] leading-[1.37] text-text-primary mb-6'>Configurações do perfil</h1>

        <div className='flex gap-6 items-start'>
          {/* Sidebar nav */}
          <nav className='w-[240px] shrink-0 bg-surface border border-border-default rounded-sm overflow-hidden'>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-5 h-9 text-left font-sans text-[13px] font-medium transition-colors',
                  activeNav === item.id
                    ? 'text-text-primary bg-elevated border-l-[3px] border-brand-accent'
                    : 'text-text-muted hover:text-text-secondary',
                )}>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Main content */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex-1 bg-surface border border-border-default rounded-sm p-8 flex flex-col gap-8'>
            {/* Section: Photo & identity */}
            <section>
              <SectionLabel>Foto e identidade</SectionLabel>
              <div className='w-full h-px bg-border-default mb-5' />
              <div className='flex items-center gap-8'>
                <Avatar src={profile?.image} name={profile?.name ?? '?'} size='xl' />
                <div>
                  <button
                    type='button'
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className='flex items-center px-4 h-8 rounded-sm border border-border-subtle bg-elevated text-text-secondary font-sans text-[12px] hover:border-brand-accent hover:text-text-primary transition-colors disabled:opacity-50'>
                    {uploading ? 'Enviando…' : 'Trocar foto'}
                  </button>
                  <input
                    ref={fileRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void handleAvatarUpload(file)
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
            <div className='flex items-center gap-3 pt-2'>
              <Button
                type='submit'
                disabled={isSubmitting || updateProfile.isPending}
                className='w-[160px] h-11 bg-brand-accent hover:bg-brand-accent/90 text-text-primary font-sans text-[13px] font-semibold'>
                {updateProfile.isPending ? 'Salvando…' : 'Salvar alterações'}
              </Button>
              <button
                type='button'
                onClick={() => router.back()}
                className='px-4 h-11 border border-border-default rounded-sm text-text-secondary font-sans text-[13px] hover:border-border-subtle transition-colors'>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
