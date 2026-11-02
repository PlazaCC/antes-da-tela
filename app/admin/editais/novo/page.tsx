'use client'

import { CallForm } from '@/components/admin/call-form'
import { PageShell } from '@/components/shared/page-shell'
import { useAdminCallMutations } from '@/lib/hooks/use-admin-call'
import { useRouter } from 'next/navigation'

/** A2 — new call (starts as draft, visible only to admins). */
export default function NewCallPage() {
  const router = useRouter()
  const { saveCall, isSaving } = useAdminCallMutations()

  return (
    <PageShell title='Novo edital' description='O edital nasce como rascunho; publique avançando para “Inscrições abertas”.'>
      <div className='max-w-[720px]'>
        <CallForm call={null} isSaving={isSaving} onSave={(input) => saveCall(input, (id) => router.push(`/admin/editais/${id}`))} />
      </div>
    </PageShell>
  )
}
