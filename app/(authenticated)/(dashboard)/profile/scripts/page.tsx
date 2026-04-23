'use client'

import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react'
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

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  draft: 'Rascunho',
}

const STATUS_COLORS: Record<string, string> = {
  published: 'text-state-success',
  draft: 'text-text-muted',
}

export default function MyScriptsPage() {
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

  return (
    <div className='px-5 md:px-8 py-7'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='font-display text-[24px] leading-[1.37] text-text-primary'>Meus Roteiros</h1>
          <p className='text-body-small text-text-muted mt-1'>
            Gerencie suas obras publicadas e rascunhos.
          </p>
        </div>
        <Button asChild className='bg-brand-accent text-text-primary hover:bg-brand-accent/90'>
          <Link href='/publish'>
            <Plus className='w-4 h-4 mr-2' />
            Novo Roteiro
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className='bg-surface border border-border-default rounded-sm p-12 flex flex-col items-center justify-center gap-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent'></div>
          <p className='font-mono text-label-mono-caps text-text-muted'>Carregando...</p>
        </div>
      ) : !data || data.scripts.length === 0 ? (
        <div className='bg-surface border border-border-default rounded-sm p-16 flex flex-col items-center justify-center text-center gap-4'>
          <div className='w-16 h-16 rounded-full bg-elevated flex items-center justify-center mb-2'>
            <Trash2 className='w-8 h-8 text-text-muted opacity-20' />
          </div>
          <p className='text-text-primary font-medium'>Nenhum roteiro encontrado</p>
          <p className='text-body-small text-text-muted max-w-[300px]'>
            Você ainda não publicou nenhum roteiro. Comece agora mesmo!
          </p>
          <Button asChild className='mt-4' variant='outline'>
            <Link href='/publish'>Publicar meu primeiro roteiro</Link>
          </Button>
        </div>
      ) : (
        <div className='bg-surface border border-border-default rounded-sm overflow-x-auto shadow-sm'>
          {/* Table header */}
          <div className='flex items-center px-5 h-10 bg-elevated/30 border-b border-border-default min-w-[600px]'>
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
            <span className='w-[40px] font-mono text-[10px] font-medium text-text-muted uppercase tracking-[0.04em] text-right'>
              Ações
            </span>
          </div>

          {/* Table rows */}
          {data.scripts.map((script) => (
            <div
              key={script.id}
              className='flex items-center px-5 h-14 border-b border-border-default last:border-0 hover:bg-elevated transition-colors min-w-[600px]'>
              <div className='flex-1 min-w-0 pr-4'>
                <Link
                  href={`/scripts/${script.id}`}
                  className='font-sans text-[13px] font-medium text-text-primary hover:text-brand-accent transition-colors truncate block'>
                  {script.title}
                </Link>
              </div>
              <span className='w-[100px] font-sans text-[12px] text-brand-accent font-medium'>
                {script.avgRating !== null ? `★ ${script.avgRating.toFixed(1)}` : '--'}
              </span>
              <span className='w-[100px] font-sans text-[12px] text-text-secondary'>
                {script.commentCount}
              </span>

              <div className='w-[120px]'>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border',
                    script.status === 'published' 
                      ? 'bg-state-success/5 border-state-success/20 text-state-success' 
                      : 'bg-text-muted/5 border-text-muted/20 text-text-muted'
                  )}>
                  {STATUS_LABELS[script.status] ?? script.status}
                </span>
              </div>

              <div className='w-[40px] flex justify-end'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='h-8 w-8 p-0 hover:bg-elevated'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='bg-surface border-border-default min-w-[140px] p-1'>
                    <DropdownMenuItem asChild className='focus:bg-elevated cursor-pointer'>
                      <Link href={`/publish?id=${script.id}`} className='flex items-center'>
                        <Pencil className='mr-2 h-4 w-4' />
                        <span>Editar</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-state-error focus:text-state-error focus:bg-state-error/10 cursor-pointer'
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

      <AlertDialog open={!!deleteScriptId} onOpenChange={(open) => !open && setDeleteScriptId(null)}>
        <AlertDialogContent className='bg-surface border-border-default'>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o roteiro e todos os seus arquivos do sistema.
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
