'use client'

import { PageShell } from '@/components/shared/page-shell'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { EditProfileForm } from './_components/edit-profile-form'

export default function EditProfilePage() {
  const { userId } = useCurrentUser()

  if (!userId) return null

  return (
    <PageShell title='Configurações do perfil' className='px-5 md:px-8 py-7'>
      <div className='max-w-[800px]'>
        <EditProfileForm userId={userId} />
      </div>
    </PageShell>
  )
}
