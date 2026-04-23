'use client'

import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { EditProfileForm } from './_components/edit-profile-form'

export default function EditProfilePage() {
  const trpc = useTRPC()
  const { userId } = useCurrentUser()

  const { data: profile, isLoading } = useQuery({
    ...trpc.users.getProfile.queryOptions({ id: userId ?? '' }),
    enabled: !!userId,
  })

  return (
    <div className='px-5 md:px-8 py-7'>
      <div className='max-w-[800px]'>
        <h1 className='font-display text-[24px] leading-[1.37] text-text-primary mb-6'>Configurações do perfil</h1>

        {isLoading ? (
          <div className='bg-surface border border-border-default rounded-sm p-12 flex flex-col items-center justify-center gap-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent'></div>
            <p className='font-mono text-label-mono-caps text-text-muted'>Carregando...</p>
          </div>
        ) : (
          <EditProfileForm profile={profile ?? null} userId={userId ?? ''} />
        )}
      </div>
    </div>
  )
}
