'use client'

import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { EditProfileForm } from './_components/edit-profile-form'

export default function EditProfilePage() {
  const { userId } = useCurrentUser()

  if (!userId) return null

  return (
    <div className='px-5 md:px-8 py-7'>
      <div className='max-w-[800px]'>
        <h1 className='font-display text-[24px] leading-[1.37] text-text-primary mb-6'>Configurações do perfil</h1>
        <EditProfileForm userId={userId} />
      </div>
    </div>
  )
}
