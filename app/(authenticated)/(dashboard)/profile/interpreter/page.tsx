import { InterpreterArea } from '@/components/interpreter/interpreter-area'
import { PageShell } from '@/components/shared/page-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Área do intérprete' }

export default function InterpreterPage() {
  return (
    <PageShell
      title='Área do intérprete'
      description='Atores e narradores aprovados participam dos castings dos editais.'
      className='px-5 md:px-8 py-7'>
      <div className='max-w-[640px]'>
        <InterpreterArea />
      </div>
    </PageShell>
  )
}
