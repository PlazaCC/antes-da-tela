'use client'

import { useScriptManagement } from '@/lib/hooks/use-script-management'
import { MetricCard } from '@/components/dashboard/metric-card'
import { ScriptsTable } from '@/components/dashboard/scripts-table'
import { DeleteScriptDialog } from '@/components/dashboard/delete-script-dialog'

export default function DashboardPage() {
  const {
    scripts,
    totalScripts,
    avgRating,
    totalComments,
    isLoading,
    isDeleting,
    deleteScriptId,
    setDeleteScriptId,
    handleDelete,
  } = useScriptManagement()

  return (
    <div className='px-5 md:px-8 py-7'>
      <div className='mb-6'>
        <h1 className='font-display text-[24px] leading-[1.37] text-text-primary'>Dashboard</h1>
        <p className='text-body-small text-text-muted mt-1'>
          Visão geral de todos os seus roteiros · Últimos 30 dias
        </p>
      </div>

      {/* Metric cards */}
      <div className='grid grid-cols-2 md:flex md:flex-row gap-4 md:gap-6 mb-8'>
        <MetricCard value={String(totalScripts)} label='Roteiros publicados' />
        <MetricCard
          value={avgRating !== null ? `${avgRating.toFixed(1)} ★` : '--'}
          label='Avaliação média'
        />
        <MetricCard value={String(totalComments)} label='Comentários totais' />
        <MetricCard value='--' label='Leituras únicas' trend='em breve' trendColor='neutral' />
      </div>

      {/* Scripts performance table */}
      <section>
        <h2 className='font-sans text-[14px] font-semibold text-text-primary mb-4'>
          Desempenho por roteiro
        </h2>

        {isLoading ? (
          <div className='bg-surface border border-border-default rounded-sm p-8'>
            <p className='font-mono text-label-mono-caps text-text-muted'>Carregando...</p>
          </div>
        ) : scripts.length === 0 ? (
          <div className='bg-surface border border-border-default rounded-sm p-8'>
            <p className='font-mono text-label-mono-caps text-text-muted'>
              Nenhum roteiro publicado ainda.
            </p>
          </div>
        ) : (
          <ScriptsTable scripts={scripts} onDeleteClick={setDeleteScriptId} />
        )}
      </section>

      <DeleteScriptDialog
        isOpen={!!deleteScriptId}
        onOpenChange={(open) => !open && setDeleteScriptId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
