'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Tag } from '@/components/ui/tag'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useQuery } from '@tanstack/react-query'
import { XIcon } from 'lucide-react'
import Link from 'next/link'
import { AuthorSection } from './author-section'
import { ModalSidebar } from './sidebar'
import { StatsSection } from './stats-section'

interface ScriptPreviewModalProps {
  scriptId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScriptPreviewModal({ scriptId, open, onOpenChange }: ScriptPreviewModalProps) {
  const trpc = useTRPC()
  const onClose = () => onOpenChange(false)

  const { data: script, isLoading: scriptLoading } = useQuery({
    ...trpc.scripts.getById.queryOptions({ id: scriptId ?? '' }),
    enabled: open && !!scriptId,
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    ...trpc.ratings.getStats.queryOptions({ scriptId: scriptId ?? '' }),
    enabled: open && !!scriptId,
  })

  const { data: commentData } = useQuery({
    ...trpc.comments.countByScript.queryOptions({ scriptId: scriptId ?? '' }),
    enabled: open && !!scriptId,
  })

  const isLoading = scriptLoading || statsLoading

  const publishedAt = script?.published_at
    ? new Date(script.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='p-0 sm:max-w-4xl max-h-[90vh] overflow-hidden bg-surface border-border-subtle gap-0'>
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>{isLoading || !script ? 'Visualização do roteiro' : script.title}</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        <DialogPrimitive.Close
          className={cn(
            'absolute top-4 right-4 z-10 w-8 h-8 rounded-sm flex items-center justify-center',
            'bg-elevated border border-border-subtle text-text-muted',
            'hover:text-text-primary hover:border-border-default transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
          )}>
          <XIcon className='w-4 h-4' />
          <span className='sr-only'>Fechar</span>
        </DialogPrimitive.Close>

        {isLoading || !script ? (
          <div className='p-8'>
            <ModalSkeleton />
          </div>
        ) : (
          <div className='flex overflow-y-auto max-h-[90vh]'>
            <ModalSidebar script={script} publishedAtFormatted={publishedAt} onClose={onClose} />

            <div className='flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 pr-12'>
              {script.title && (
                <h1 className='font-display text-heading-2 text-text-primary uppercase tracking-wide'>
                  {script.title}
                </h1>
              )}
              
              <AuthorSection author={script.author} ratingData={stats} onClose={onClose} />

              {(script.genre || script.age_rating) && (
                <div className='flex flex-wrap gap-2'>
                  {script.genre && (
                    <Tag variant='drama' className='uppercase font-mono text-[10px] tracking-wider px-2 py-0.5'>
                      {script.genre}
                    </Tag>
                  )}
                  {script.age_rating && (
                    <Tag variant='privado' className='uppercase font-mono text-[10px] tracking-wider px-2 py-0.5'>
                      {script.age_rating}
                    </Tag>
                  )}
                </div>
              )}

              <div className='w-full h-px bg-border-subtle' />

              <StatsSection
                ratingData={stats}
                commentData={commentData}
                distributionData={stats}
              />

              <div className='w-full h-px bg-border-subtle' />

              {script.logline && (
                <div className='flex flex-col gap-3'>
                  <span className='font-mono text-label-mono-caps text-brand-accent uppercase tracking-[0.05em]'>
                    Logline
                  </span>
                  <blockquote className='border-l-2 border-brand-accent pl-5'>
                    <p className='text-body-default text-text-primary leading-relaxed'>{script.logline}</p>
                  </blockquote>
                </div>
              )}

              {script.synopsis && (
                <div className='flex flex-col gap-3'>
                  <span className='font-mono text-label-mono-caps text-brand-accent uppercase tracking-[0.05em]'>
                    Sinopse
                  </span>
                  <p className='text-body-default text-text-secondary leading-relaxed line-clamp-6'>
                    {script.synopsis}
                  </p>
                </div>
              )}

              <div className='pt-2 md:hidden'>
                <Link
                  href={`/scripts/${script.id}`}
                  className={cn(
                    'flex items-center justify-center w-full py-2.5 rounded-sm',
                    'bg-brand-accent text-white font-semibold text-body-small',
                    'hover:bg-brand-accent/90 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
                  )}
                  onClick={onClose}>
                  Ler Roteiro
                </Link>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ModalSkeleton() {
  return (
    <div className='flex flex-col md:flex-row gap-6'>
      <div className='hidden md:flex flex-col shrink-0 gap-6 rounded-sm w-64'>
        <Skeleton className='h-[260px] rounded-sm' />
        <div className='flex flex-col gap-3'>
          <Skeleton className='h-4 w-1/2' />
          <Skeleton className='h-4 w-1/3' />
        </div>
        <div className='flex flex-col gap-2 mt-auto'>
          <Skeleton className='h-4 w-full rounded-full ' />
          <Skeleton className='h-10 w-full rounded-sm bg-brand-accent/20' />
        </div>
      </div>

      <div className='flex-1 flex flex-col gap-5 p-6 md:p-8'>
        <Skeleton className='h-10 w-3/4 ' />
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-10 w-10 rounded-full' />
            <Skeleton className='h-4 w-44 ' />
          </div>
          <Skeleton className='h-8 w-32 rounded-sm ' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-5 w-20 rounded-full ' />
          <Skeleton className='h-5 w-16 rounded-full ' />
        </div>
        <Skeleton className='h-px w-full bg-border-subtle' />
        <div className='grid gap-3'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-3 w-24 ' />
            <Skeleton className='h-4 w-full ' />
          </div>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-3 w-20 ' />
            <Skeleton className='h-4 w-full ' />
            <Skeleton className='h-4 w-5/6 ' />
          </div>
        </div>
      </div>
    </div>
  )
}
