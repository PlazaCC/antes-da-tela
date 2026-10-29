'use client'

import { CallPhaseTag } from '@/components/calls/call-phase-tag'
import { LoadingState } from '@/components/shared/loading-state'
import { PageShell } from '@/components/shared/page-shell'
import { Button } from '@/components/ui/button'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

/** A2 — calls managed by the staff. */
export default function AdminCallsPage() {
  const trpc = useTRPC()
  const { data: calls, isLoading } = useQuery(trpc.admin.listCalls.queryOptions())

  return (
    <PageShell
      title='Editais'
      headerActions={
        <Button asChild>
          <Link href='/admin/editais/novo'>+ Novo edital</Link>
        </Button>
      }>
      {isLoading && <LoadingState label='editais' />}
      {calls?.length === 0 && <p className='text-body-small text-text-muted'>Nenhum edital criado.</p>}
      <div className='flex flex-col gap-3'>
        {calls?.map((call) => (
          <Link
            key={call.id}
            href={`/admin/editais/${call.id}`}
            className='rounded-sm border border-border-default bg-surface p-4 flex flex-wrap items-center gap-3 hover:border-text-muted'>
            <span className='font-medium text-text-primary flex-1 min-w-[200px]'>{call.title}</span>
            <CallPhaseTag phase={call.phase} />
            <span className='text-xs text-text-muted'>
              {call.pendingEntries} pendentes · {call.approvedEntries} aprovadas
            </span>
          </Link>
        ))}
      </div>
    </PageShell>
  )
}
