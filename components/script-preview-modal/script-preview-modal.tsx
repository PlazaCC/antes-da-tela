'use client'

import { AudioPlayer, type AudioTrack } from '@/components/audio-player'
import { PdfFullscreenDialog } from '@/components/pdf-viewer/pdf-fullscreen-dialog'
import { RatingSummary } from '@/components/rating-summary/rating-summary'
import { Tag } from '@/components/tag/tag'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { cn, getStorageUrl } from '@/lib/utils'
import { formatPublishedDate } from '@/lib/utils/format-date'
import { formatAgeRating } from '@/lib/constants/scripts'
import { useTRPC } from '@/trpc/client'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useQuery } from '@tanstack/react-query'
import { FileText, XIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { AuthorSection } from './author-section'
import { ModalSidebar } from './sidebar'
import { StatsSection } from './stats-section'

interface ScriptPreviewModalProps {
  scriptId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScriptPreviewModal({
  scriptId,
  open,
  onOpenChange,
}: ScriptPreviewModalProps) {
  const trpc = useTRPC()
  const onClose = () => onOpenChange(false)
  const [pitchDeckOpen, setPitchDeckOpen] = useState(false)

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
    ? formatPublishedDate(script.published_at)
    : null

  const coverUrl = getStorageUrl('avatars', script?.cover_path)
  const bannerUrl = getStorageUrl('avatars', script?.banner_path)
  const pitchDeckUrl = getStorageUrl('scripts', script?.pitch_deck_path)

  const audios: AudioTrack[] = (script?.audio_files ?? []).flatMap((a) => {
    const url = getStorageUrl('audio', a.storage_path)
    return url
      ? [
          {
            url,
            title: a.title ?? 'Faixa de áudio',
            description: a.description,
          },
        ]
      : []
  })

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[90vh] gap-0 overflow-hidden border-border-subtle bg-surface p-0 md:max-w-4xl"
        >
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>
                {isLoading || !script
                  ? 'Visualização do roteiro'
                  : script.title}
              </DialogTitle>
            </VisuallyHidden>
          </DialogHeader>

          <DialogPrimitive.Close
            className={cn(
              'absolute right-4 top-4 z-[9999] flex h-8 w-8 items-center justify-center rounded-sm',
              'border border-border-subtle bg-elevated text-text-muted',
              'transition-colors hover:border-border-default hover:text-text-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent'
            )}
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>

          {isLoading || !script ? (
            <div className="p-6 md:p-8">
              <ModalSkeleton />
            </div>
          ) : (
            <div className="relative flex max-h-[90vh] flex-col overflow-hidden md:flex-row">
              {/* Background Cover with Gradient Overlay (Mobile Only) */}
              {bannerUrl && (
                <div className="absolute inset-0 z-0 md:hidden">
                  <Image
                    src={bannerUrl}
                    alt={script.title}
                    fill
                    className="object-cover opacity-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/90 to-transparent" />
                </div>
              )}

              <ModalSidebar
                script={script}
                publishedAtFormatted={publishedAt}
                coverUrl={coverUrl}
                pitchDeckUrl={pitchDeckUrl}
                onOpenPitchDeck={() => setPitchDeckOpen(true)}
                onClose={onClose}
              />
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="z-10 flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-5 pb-28 md:gap-6 md:p-8 md:pb-8">
                  {script.title && (
                    <h1 className="font-display text-heading-3 uppercase leading-tight tracking-wide text-text-primary md:text-heading-2">
                      {script.title}
                    </h1>
                  )}

                  <AuthorSection author={script.author} onClose={onClose} />

                  {stats && (
                    <RatingSummary
                      average={stats?.average ?? 0}
                      total={stats?.total ?? 0}
                    />
                  )}
                  {(script.genre ||
                    (script.subgenres && script.subgenres.length > 0) ||
                    script.age_rating) && (
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {script.genre && (
                        <Tag
                          variant="drama"
                          className="px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider md:text-[10px]"
                        >
                          {script.genre}
                        </Tag>
                      )}
                      {script.subgenres?.map((sub) => (
                        <Tag
                          key={sub}
                          variant="neutro"
                          className="px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider md:text-[10px]"
                        >
                          {sub}
                        </Tag>
                      ))}
                      {script.age_rating && (
                        <Tag
                          variant="privado"
                          className="px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider md:text-[10px]"
                        >
                          {formatAgeRating(script.age_rating)}
                        </Tag>
                      )}
                    </div>
                  )}

                  <div className="h-px w-full border-b border-border-subtle" />

                  <StatsSection
                    ratingData={stats}
                    commentData={commentData}
                    distributionData={stats}
                  />

                  <div className="h-px w-full border-b border-border-subtle" />

                  {script.logline && (
                    <div className="flex flex-col gap-2 md:gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-brand-accent">
                        Logline
                      </span>
                      <blockquote className="border-l-2 border-brand-accent pl-4 md:pl-5">
                        <p className="text-body-small leading-relaxed text-text-primary md:text-body-default">
                          {script.logline}
                        </p>
                      </blockquote>
                    </div>
                  )}

                  {script.synopsis && (
                    <div className="flex flex-col gap-2 md:gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-brand-accent">
                        Sinopse
                      </span>
                      <p className="line-clamp-6 text-body-small leading-relaxed text-text-secondary md:text-body-default">
                        {script.synopsis}
                      </p>
                    </div>
                  )}
                </div>
                {audios.length > 0 && (
                  <div className="flex flex-col gap-3 md:gap-4">
                    <div className="overflow-hidden rounded-sm border border-border-subtle">
                      <AudioPlayer audios={audios} title={script.title} />
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed CTA at bottom on mobile */}
              <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col gap-2 border-t border-border-subtle bg-surface/80 p-2 backdrop-blur-md md:hidden">
                {pitchDeckUrl && (
                  <button
                    type="button"
                    onClick={() => setPitchDeckOpen(true)}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-sm py-3',
                      'border border-border-subtle bg-surface/60 text-body-small font-medium text-text-secondary',
                      'transition-colors hover:border-border-default hover:text-text-primary',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base'
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    Pitch Deck
                  </button>
                )}
                <Link
                  href={`/scripts/${script.id}`}
                  className={cn(
                    'flex w-full items-center justify-center rounded-sm py-3',
                    'bg-brand-accent text-body-small font-semibold text-white shadow-lg shadow-brand-accent/20',
                    'transition-colors hover:bg-brand-accent/90',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base'
                  )}
                  onClick={onClose}
                >
                  Ler Roteiro
                </Link>
                 {audios.length > 0 && (
                  <div className="flex flex-col">
                    <div className=" rounded-sm border border-border-subtle">
                      <AudioPlayer audios={audios} title={script.title} />
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {pitchDeckUrl && script && (
        <PdfFullscreenDialog
          open={pitchDeckOpen}
          onOpenChange={setPitchDeckOpen}
          url={pitchDeckUrl}
          title={`Pitch Deck — ${script.title}`}
        />
      )}
    </>
  )
}

function ModalSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="hidden w-64 shrink-0 flex-col gap-6 rounded-sm md:flex">
        <Skeleton className="h-[260px] rounded-sm" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-10 w-full rounded-sm bg-brand-accent/20" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6 md:p-8">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-8 w-32 rounded-sm" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-px w-full bg-border-subtle" />
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  )
}
