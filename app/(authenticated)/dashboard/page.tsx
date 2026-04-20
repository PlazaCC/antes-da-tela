'use client'

import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

function MetricCard({
  value,
  label,
  trend,
  trendColor,
}: {
  value: string
  label: string
  trend?: string
  trendColor?: 'positive' | 'negative' | 'neutral'
}) {
  const trendClass =
    trendColor === 'positive'
      ? 'text-brand-lime'
      : trendColor === 'negative'
        ? 'text-state-error'
        : 'text-text-muted'

  return (
    <div className='flex-1 min-w-0 bg-surface border border-border-default rounded-sm p-5'>
      <p className='font-display text-[24px] leading-[1.37] text-text-primary'>{value}</p>
      <p className='font-mono text-label-mono-small text-text-muted uppercase tracking-[0.04em] mt-2'>{label}</p>
      {trend && <p className={cn('font-mono text-[11px] font-medium mt-1', trendClass)}>{trend}</p>}
    </div>
  )
}

const NAV_ITEMS = [
  { id: 'dashboard', label: '📊  Dashboard', href: '/dashboard' },
  { id: 'scripts', label: '📖  Meus roteiros', href: '/publish' },
  { id: 'ratings', label: '⭐  Avaliações', href: '#' },
  { id: 'notifications', label: '🔔  Notificações', href: '#' },
  { id: 'settings', label: '⚙  Configurações', href: '/profile/edit' },
] as const

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  draft: 'Rascunho',
}

const STATUS_COLORS: Record<string, string> = {
  published: 'text-state-success',
  draft: 'text-text-muted',
}

export default function DashboardPage() {
  const trpc = useTRPC()
  const { data, isLoading } = useQuery(trpc.scripts.getDashboardMetrics.queryOptions())

  const totalScripts = data?.totalScripts ?? 0
  const avgRating = data?.avgRating
  const totalComments = (data?.scripts ?? []).reduce((sum, s) => sum + s.commentCount, 0)

  return (
    <div className='min-h-screen bg-bg-base flex'>
      {/* Sidebar */}
      <aside className='w-[220px] shrink-0 bg-surface border-r border-border-default min-h-screen'>
        <nav className='py-6'>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center px-5 h-9 font-sans text-[12px] font-medium transition-colors',
                item.id === 'dashboard'
                  ? 'text-text-primary bg-elevated border-l-[3px] border-brand-accent'
                  : 'text-text-muted hover:text-text-secondary',
              )}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className='flex-1 px-8 py-7'>
        <div className='mb-6'>
          <h1 className='font-display text-[24px] leading-[1.37] text-text-primary'>Dashboard</h1>
          <p className='text-body-small text-text-muted mt-1'>
            Visão geral de todos os seus roteiros · Últimos 30 dias
          </p>
        </div>

        {/* Metric cards */}
        <div className='flex gap-6 mb-8'>
          <MetricCard value={String(totalScripts)} label='Roteiros publicados' />
          <MetricCard
            value={avgRating !== null && avgRating !== undefined ? `${avgRating} ★` : '--'}
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
          ) : !data || data.scripts.length === 0 ? (
            <div className='bg-surface border border-border-default rounded-sm p-8'>
              <p className='font-mono text-label-mono-caps text-text-muted'>
                Nenhum roteiro publicado ainda.
              </p>
            </div>
          ) : (
            <div className='bg-surface border border-border-default rounded-sm overflow-hidden'>
              {/* Table header */}
              <div className='flex items-center px-5 h-9 border-b border-border-default'>
                <span className='flex-1 font-mono text-[10px] font-medium text-text-muted uppercase tracking-[0.04em]'>
                  Roteiro
                </span>
                <span className='w-[100px] font-mono text-[10px] font-medium text-text-muted uppercase tracking-[0.04em]'>
                  Avaliação
                </span>
                <span className='w-[100px] font-mono text-[10px] font-medium text-text-muted uppercase tracking-[0.04em]'>
                  Comentários
                </span>
                <span className='w-[120px] font-mono text-[10px] font-medium text-text-muted uppercase tracking-[0.04em]'>
                  Status
                </span>
              </div>

              {/* Table rows */}
              {data.scripts.map((script) => (
                <div
                  key={script.id}
                  className='flex items-center px-5 h-11 border-b border-border-default last:border-0 hover:bg-elevated transition-colors'>
                  <Link
                    href={`/scripts/${script.id}`}
                    className='flex-1 font-sans text-[12px] text-text-secondary hover:text-text-primary transition-colors truncate pr-4'>
                    {script.title}
                  </Link>
                  <span className='w-[100px] font-sans text-[12px] text-brand-accent'>
                    {script.avgRating !== null ? `★ ${script.avgRating}` : '--'}
                  </span>
                  <span className='w-[100px] font-sans text-[12px] text-text-secondary'>
                    {script.commentCount}
                  </span>
                  <span
                    className={cn(
                      'w-[120px] font-sans text-[12px]',
                      STATUS_COLORS[script.status] ?? 'text-text-muted',
                    )}>
                    {STATUS_LABELS[script.status] ?? script.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
