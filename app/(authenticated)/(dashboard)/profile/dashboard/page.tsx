'use client'

import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

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
  const queryClient = useQueryClient()
  const [deleteScriptId, setDeleteScriptId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading } = useQuery(trpc.scripts.getDashboardMetrics.queryOptions())

  const deleteMutation = useMutation(
    trpc.scripts.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Roteiro excluído com sucesso')
        queryClient.invalidateQueries(trpc.scripts.getDashboardMetrics.queryFilter())
        setDeleteScriptId(null)
      },
      onError: (error) => {
        toast.error('Erro ao excluir roteiro: ' + error.message)
      },
      onSettled: () => {
        setIsDeleting(false)
      },
    }),
  )

  const handleDelete = async () => {
    if (!deleteScriptId) return
    setIsDeleting(true)
    deleteMutation.mutate({ id: deleteScriptId })
  }

  const totalScripts = data?.totalScripts ?? 0
  const avgRating = data?.avgRating
  const totalComments = (data?.scripts ?? []).reduce((sum, s) => sum + s.commentCount, 0)

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
            value={avgRating !== null && avgRating !== undefined ? `${avgRating.toFixed(1)} ★` : '--'}
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
            <div className='bg-surface border border-border-default rounded-sm overflow-x-auto'>
              {/* Table header */}
              <div className='flex items-center px-5 h-9 border-b border-border-default min-w-[700px]'>
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
                <span className='w-[40px] font-mono text-[10px] font-medium text-text-muted uppercase tracking-[0.04em]'>
                  Ações
                </span>
              </div>

              {/* Table rows */}
              {data.scripts.map((script) => (
                <div
                  key={script.id}
                  className='flex items-center px-5 h-11 border-b border-border-default last:border-0 hover:bg-elevated transition-colors min-w-[700px]'>
                  <Link
                    href={`/scripts/${script.id}`}
                    className='flex-1 font-sans text-[12px] text-text-secondary hover:text-text-primary transition-colors truncate pr-4'>
                    {script.title}
                  </Link>
                  <span className='w-[100px] font-sans text-[12px] text-brand-accent'>
                    {script.avgRating !== null ? `★ ${script.avgRating.toFixed(1)}` : '--'}
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

                  <div className='w-[40px] flex justify-end'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <span className='sr-only'>Abrir menu</span>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='bg-surface border-border-default'>
                        <DropdownMenuItem asChild>
                          <Link href={`/publish?id=${script.id}`} className='flex items-center cursor-pointer'>
                            <Pencil className='mr-2 h-4 w-4' />
                            <span>Editar</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-state-error focus:text-state-error cursor-pointer'
                          onClick={() => setDeleteScriptId(script.id)}>
                          <Trash2 className='mr-2 h-4 w-4' />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <AlertDialog open={!!deleteScriptId} onOpenChange={(open) => !open && setDeleteScriptId(null)}>
          <AlertDialogContent className='bg-surface border-border-default'>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o roteiro e todos os seus dados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete()
                }}
                disabled={isDeleting}
                className='bg-state-error text-white hover:bg-state-error/90'>
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  )
}
