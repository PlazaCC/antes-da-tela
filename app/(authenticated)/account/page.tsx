'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAvatarUpload } from '@/lib/hooks/use-avatar-upload'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { profileSchema, type ProfileFormValues } from '@/lib/validators/profile'
import { useTRPC } from '@/trpc/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export default function AccountPage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
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
          toast.success('Profile updated.')
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <main className='max-w-sm mx-auto px-5 py-12 flex flex-col gap-8'>
      <h1 className='font-display text-heading-2 text-primary'>My Account</h1>

      {/* Avatar */}
      <section className='flex flex-col gap-3'>
        <label className='font-mono text-label-mono-caps text-secondary uppercase tracking-wider text-xs'>Avatar</label>
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
            {isUploading ? 'Uploading…' : 'Change photo'}
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
          <label className='font-mono text-label-mono-caps text-secondary uppercase tracking-wider text-xs'>Name</label>
          <Input {...register('name')} placeholder='Your name' />
          {errors.name && <p className='text-state-error text-xs font-mono'>{errors.name.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <label className='font-mono text-label-mono-caps text-secondary uppercase tracking-wider text-xs'>Bio</label>
          <Input {...register('bio')} placeholder='A short bio (optional)' />
          {errors.bio && <p className='text-state-error text-xs font-mono'>{errors.bio.message}</p>}
        </div>

        <Button type='submit' disabled={isSubmitting || updateProfile.isPending}>
          {updateProfile.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </main>
  )
}
