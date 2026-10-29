import { InterpreterQueue } from '@/components/admin/interpreter-queue'
import { PageShell } from '@/components/shared/page-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Curadoria de intérpretes' }

export default function AdminInterpretersPage() {
  return (
    <PageShell title='Curadoria de intérpretes' description='Aprove ou reprove os cadastros de atores e narradores.'>
      <InterpreterQueue />
    </PageShell>
  )
}
