'use client'

import { DeactivateAccountDialog } from '@/components/account/deactivate-account-dialog'
import { DeleteAccountDialog } from '@/components/account/delete-account-dialog'
import { PageShell } from '@/components/shared/page-shell'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { EditProfileForm } from './_components/edit-profile-form'

export default function EditProfilePage() {
  const { userId, email } = useCurrentUser()

  if (!userId) return null

  return (
    <PageShell title='Configurações do perfil' className='px-5 md:px-8 py-7'>
      <div className='max-w-[800px] flex flex-col gap-10'>
        <EditProfileForm userId={userId} />

        <section className='flex flex-col gap-3 border-t border-border-subtle pt-6'>
          <p className='font-mono text-[11px] text-red-500 uppercase tracking-wider'>Zona de Perigo</p>
          <div className='flex flex-col gap-2'>
            <DeactivateAccountDialog />
            <DeleteAccountDialog email={email ?? ''} />
          </div>
        </section>
      </div>
    </PageShell>
  )
}
