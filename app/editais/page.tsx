import { CallCard } from '@/components/calls/call-card'
import { PageShell } from '@/components/shared/page-shell'
import { getQueryClient, trpc } from '@/trpc/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editais',
  description: 'Inscreva seu roteiro, participe do casting como intérprete ou vote nos roteiros que serão interpretados.',
}

/** E1 — public list of calls. */
export default async function CallsPage() {
  const calls = await getQueryClient().fetchQuery(trpc.calls.list.queryOptions())

  return (
    <PageShell title='Editais' description='Inscreva seu roteiro, participe do casting ou vote nos roteiros que serão interpretados.'>
      {calls.length === 0 ? (
        <p className='text-body-small text-text-muted'>Nenhum edital aberto no momento.</p>
      ) : (
        <div className='grid gap-4 md:grid-cols-2'>
          {calls.map((call) => (
            <CallCard key={call.id} call={call} />
          ))}
        </div>
      )}
    </PageShell>
  )
}
