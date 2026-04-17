'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/ui/star-rating'
import { Tag } from '@/components/ui/tag'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { BookOpenIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ScriptPreviewModalProps {
  scriptId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScriptPreviewModal({ scriptId, open, onOpenChange }: ScriptPreviewModalProps) {
  const trpc = useTRPC()

  const { data: script, isLoading: scriptLoading } = useQuery({
    ...trpc.scripts.getById.queryOptions({ id: scriptId ?? '' }),
    enabled: open && !!scriptId,
  })

  const { data: ratingData, isLoading: ratingLoading } = useQuery({
    ...trpc.ratings.getAverage.queryOptions({ scriptId: scriptId ?? '' }),
    enabled: open && !!scriptId,
  })

  const isLoading = scriptLoading || ratingLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-surface border-border-subtle'>
        {isLoading || !script ? (
          <ModalSkeleton />
        ) : (
          <>
            <DialogHeader className='gap-3'>
              <div className='flex items-start justify-between gap-4 pr-8'>
                <div className='flex flex-col gap-1.5 min-w-0'>
                  {script.genre && (
                    <p className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider text-xs'>
                      {script.genre}
                    </p>
                  )}
                  <DialogTitle className='text-heading-2 font-display text-text-primary leading-tight'>
                    {script.title}
                  </DialogTitle>
                </div>
                {script.age_rating && (
                  <Tag variant='privado' className='shrink-0 mt-1'>
                    {script.age_rating}
                  </Tag>
                )}
              </div>
            </DialogHeader>

            {/* Author row */}
            <div className='flex items-center gap-3'>
              {script.author?.image ? (
                <Image
                  src={script.author.image}
                  alt={script.author.name ?? ''}
                  width={32}
                  height={32}
                  className='rounded-full object-cover shrink-0'
                />
              ) : (
                <div className='w-8 h-8 rounded-full bg-elevated border border-border-subtle shrink-0' />
              )}
              <div className='flex flex-col gap-0'>
                <span className='text-body-small text-text-secondary'>por</span>
                <Link
                  href={`/profile/${script.author?.id}`}
                  className='text-body-small font-medium text-text-primary hover:text-brand-accent transition-colors'
                  onClick={() => onOpenChange(false)}
                >
                  {script.author?.name ?? 'Autor desconhecido'}
                </Link>
              </div>
            </div>

            {/* Rating + page count */}
            <div className='flex items-center gap-4'>
              {ratingData && (
                <div className='flex items-center gap-2'>
                  <StarRating value={ratingData.average} readOnly allowHalf />
                  <span className='font-mono text-label-mono-small text-text-muted'>
                    {ratingData.average > 0 ? ratingData.average.toFixed(1) : '—'}
                  </span>
                  {ratingData.total > 0 && (
                    <span className='text-body-small text-text-muted'>({ratingData.total})</span>
                  )}
                </div>
              )}
              {script.script_files?.[0]?.page_count && (
                <span className='font-mono text-label-mono-small text-text-muted'>
                  {script.script_files[0].page_count}p
                </span>
              )}
            </div>

            <div className='w-full h-px bg-border-subtle' />

            {/* Logline */}
            {script.logline && (
              <p className='text-body-default text-text-primary font-medium italic leading-relaxed'>
                {script.logline}
              </p>
            )}

            {/* Synopsis */}
            {script.synopsis && (
              <div className='flex flex-col gap-1.5'>
                <h4 className='text-body-small font-semibold text-text-muted uppercase tracking-wide'>Sinopse</h4>
                <p className='text-body-default text-text-secondary leading-relaxed line-clamp-6'>
                  {script.synopsis}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className='pt-2'>
              <Link
                href={`/scripts/${script.id}`}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-sm',
                  'bg-brand-accent text-white font-semibold text-body-default',
                  'hover:bg-brand-accent/90 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
                )}
                onClick={() => onOpenChange(false)}
              >
                <BookOpenIcon className='w-4 h-4' />
                Ler roteiro
              </Link>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ModalSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-3 w-20' />
        <Skeleton className='h-7 w-3/4' />
      </div>
      <div className='flex items-center gap-3'>
        <Skeleton className='h-8 w-8 rounded-full' />
        <Skeleton className='h-4 w-32' />
      </div>
      <Skeleton className='h-4 w-48' />
      <Skeleton className='h-px w-full' />
      <Skeleton className='h-5 w-full' />
      <div className='flex flex-col gap-1.5'>
        <Skeleton className='h-3 w-16' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
      </div>
      <Skeleton className='h-10 w-36' />
    </div>
  )
}
