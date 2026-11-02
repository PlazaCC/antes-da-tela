'use client'

import { CallForm } from '@/components/admin/call-form'
import { CallPhaseControl } from '@/components/admin/call-phase-control'
import { CallResultsForm } from '@/components/admin/call-results-form'
import { EntryReviewList } from '@/components/admin/entry-review-list'
import { LoadingState } from '@/components/shared/loading-state'
import { PageShell } from '@/components/shared/page-shell'
import { SectionHeading } from '@/components/shared/section-heading'
import { useAdminCallMutations } from '@/lib/hooks/use-admin-call'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { use } from 'react'

/** A2 + A3 — edit a call, move its phase and review its entries. */
export default function AdminCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const trpc = useTRPC()
  const { data: call, isLoading } = useQuery(trpc.admin.getCall.queryOptions({ id }))
  const { data: entries } = useQuery(trpc.admin.listEntries.queryOptions({ callId: id }))
  const { data: counts } = useQuery(trpc.admin.callResults.queryOptions({ callId: id }))
  const { saveCall, setPhase, reviewEntry, saveResult, isSaving } = useAdminCallMutations()

  if (isLoading) return <LoadingState label='edital' />
  if (!call) return <PageShell title='Edital não encontrado'>{null}</PageShell>

  return (
    <PageShell title={call.title}>
      <div className='flex gap-4 text-xs'>
        <Link href={`/editais/${call.slug}`} className='text-text-muted underline underline-offset-2'>
          Ver página pública
        </Link>
        <Link href={`/admin/editais/${call.id}/casting`} className='text-text-muted underline underline-offset-2'>
          Curadoria de casting
        </Link>
      </div>
      <CallPhaseControl phase={call.phase} isSaving={isSaving} onChange={(phase) => setPhase(call.id, phase)} />

      <section className='flex flex-col gap-4'>
        <SectionHeading>Inscrições</SectionHeading>
        <EntryReviewList entries={entries ?? []} isSaving={isSaving} onReview={reviewEntry} />
      </section>

      {(call.phase === 'voting' || call.phase === 'finished') && (
        <section className='flex flex-col gap-4 max-w-[720px]'>
          <SectionHeading>Resultado e live</SectionHeading>
          <CallResultsForm key={call.id} call={call} entries={entries ?? []} counts={counts ?? null} isSaving={isSaving} onSave={saveResult} />
        </section>
      )}

      <section className='flex flex-col gap-4 max-w-[720px]'>
        <SectionHeading>Dados do edital</SectionHeading>
        <CallForm key={call.id} call={call} isSaving={isSaving} onSave={(input) => saveCall(input, () => {})} />
      </section>
    </PageShell>
  )
}
