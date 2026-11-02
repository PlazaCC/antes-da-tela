'use client'

import { ScriptInsightsView } from '@/components/dashboard/script-insights/script-insights-view'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ScriptInsightsPage() {
  const { id } = useParams<{ id: string }>()
  const trpc = useTRPC()
  const { data, isLoading, error } = useQuery(trpc.scripts.getInsights.queryOptions({ id }))

  return (
    <div className='px-5 md:px-8 py-7'>
      {isLoading ? (
        <p className='font-mono text-label-mono-caps text-text-muted'>Carregando...</p>
      ) : error || !data ? (
        <div className='flex flex-col gap-3'>
          <p className='text-body-default text-text-secondary'>Não encontramos esse roteiro entre os seus.</p>
          <Link href='/profile/dashboard' className='text-body-small text-brand-accent'>
            Voltar ao dashboard
          </Link>
        </div>
      ) : (
        <ScriptInsightsView insights={data} />
      )}
    </div>
  )
}
