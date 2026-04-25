'use client'

import { AudioPlayer } from '@/components/audio-player'
import { CommentsSheet } from '@/components/comments/comments-sheet'
import { PDFViewer } from '@/components/pdf-viewer'
import { CommentsSidebar } from '@/components/pdf-viewer/comments-sidebar'
import { ScriptPageMetadata } from '@/components/script-page/script-page-metadata'
import { SynopsisSpoiler } from '@/components/synopsis/SynopsisSpoiler'
import type { TagVariant } from '@/components/tag/tag'
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
import { useScriptRating } from '@/lib/hooks/use-script-rating'
import { cn } from '@/lib/utils'
import type { AppRouter } from '@/server/api/root'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { inferRouterOutputs } from '@trpc/server'
import { Film } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type RouterOutput = inferRouterOutputs<AppRouter>
type ScriptDetail = RouterOutput['scripts']['getById']

const GENRE_VARIANT_MAP: Record<string, TagVariant> = {
  drama: 'drama',
  thriller: 'thriller',
  comédia: 'comédia',
}

interface Props {
  script: ScriptDetail
  pdfUrl: string | null
  audioUrl: string | null
  bannerUrl: string | null
  coverUrl: string | null
  currentUserId: string | null
}

export function ScriptPageClient({ script, pdfUrl, audioUrl, bannerUrl, coverUrl, currentUserId }: Props) {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const averageOpts = trpc.ratings.getAverage.queryOptions({ scriptId: script?.id ?? '' })
  const userRatingOpts = trpc.ratings.getUserRating.queryOptions({
    scriptId: script?.id ?? '',
    userId: currentUserId ?? '',
  })

  const { data: ratingData } = useQuery({ ...averageOpts, enabled: !!script })
  const { data: userRating } = useQuery({ ...userRatingOpts, enabled: !!script && !!currentUserId })

  const { rate, isPending: isRatingPending } = useScriptRating(script?.id ?? '', currentUserId)

  const deleteMutation = useMutation(
    trpc.scripts.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Roteiro excluído com sucesso')
        queryClient.invalidateQueries(trpc.scripts.listFeatured.queryFilter())
        queryClient.invalidateQueries(trpc.scripts.listRecent.queryFilter())
        queryClient.invalidateQueries(trpc.scripts.listByAuthor.queryFilter({ authorId: currentUserId ?? '' }))
        router.push('/profile/dashboard')
      },
      onError: (error) => {
        toast.error('Erro ao excluir roteiro: ' + error.message)
      },
      onSettled: () => {
        setIsDeleting(false)
        setDeleteModalOpen(false)
      },
    }),
  )

  const handleDelete = () => {
    if (!script) return
    setIsDeleting(true)
    deleteMutation.mutate({ id: script.id })
  }

  if (!script) {
    return (
      <div className='min-h-dvh bg-bg-base flex items-center justify-center'>
        <p className='text-state-error font-mono text-label-mono-default'>Roteiro não encontrado.</p>
      </div>
    )
  }

  const genreVariant: TagVariant = GENRE_VARIANT_MAP[script.genre ?? ''] ?? 'default'
  const isOwner = !!currentUserId && currentUserId === script.author?.id

  const handleDeleteTrigger = () => setDeleteModalOpen(true)

  return (
    <div
      className={cn('bg-bg-base flex flex-col min-h-dvh', audioUrl && 'pb-[calc(54px+env(safe-area-inset-bottom))]')}>
      {/* Breadcrumbs */}
      <div className='flex items-center gap-2 px-5 py-3 border-b border-border-subtle bg-bg-base'>
        <Link
          href='/'
          className='font-mono text-label-mono-small text-text-muted hover:text-text-primary transition-colors'>
          ← Home
        </Link>
        <span className='text-text-muted font-mono text-label-mono-small'>/</span>
        <span className='font-mono text-label-mono-small text-text-secondary truncate max-w-[140px] md:max-w-[280px]'>
          {script.title}
        </span>
      </div>

      {/* Hero Banner — only rendered when bannerUrl exists */}
      {bannerUrl && (
        <div className='relative w-full h-[200px] md:h-[300px] lg:h-[420px] overflow-hidden bg-elevated'>
          <Image src={bannerUrl} alt={script.title} fill priority className='object-cover object-center' />
          <div className='absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent' />
          <div className='absolute bottom-0 left-0 right-0 px-5 md:px-12 pb-8 max-w-6xl mx-auto w-full'>
            <h1 className='font-display text-heading-2 md:text-heading-1 text-text-primary leading-tight line-clamp-2'>
              {script.title}
            </h1>
            {script.logline && (
              <p className='text-body-default text-text-secondary mt-2 line-clamp-2 max-w-2xl'>{script.logline}</p>
            )}
          </div>
        </div>
      )}

      {/* Script metadata */}
      <div className='max-w-6xl mx-auto w-full px-5 py-6'>
        <ScriptPageMetadata
          script={script}
          bannerUrl={bannerUrl}
          coverUrl={coverUrl}
          genreVariant={genreVariant}
          isOwner={isOwner}
          currentUserId={currentUserId}
          ratingData={ratingData}
          userRating={userRating}
          isRatingPending={isRatingPending}
          onRate={rate}
          onDelete={handleDeleteTrigger}
        />
      </div>

      {/* Synopsis — visible above the reader when PDF is present */}
      {pdfUrl && script.synopsis && (
        <div className='max-w-6xl mx-auto w-full px-5 pb-6 border-t border-border-subtle pt-6'>
          <h3 className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider mb-3'>Sinopse</h3>
          <SynopsisSpoiler text={script.synopsis} collapsedHeight={144} />
        </div>
      )}

      {/* Audio player — fixed bottom bar on all viewports (Spotify-style) */}
      {audioUrl && <AudioPlayer src={audioUrl} title={script.title} />}

      {/* Reader — 50/50 split; page scrolls, sidebar sticks to viewport */}
      {pdfUrl ? (
        <div className='flex flex-col lg:flex-row border-t border-border-subtle'>
          {/* PDF column — natural height, page provides the single scroll */}
          <div className='flex-1 min-w-0 lg:w-1/2 min-h-[60vh]'>
            <PDFViewer url={pdfUrl} />
          </div>

          {/* Comments sidebar — sticky 50%, fills viewport below navbar */}
          <div
            className={cn(
              'hidden lg:flex flex-col lg:w-1/2 border-l border-border-subtle sticky top-14 self-start',
              audioUrl ? 'h-[calc(100vh-3.5rem-54px)]' : 'h-[calc(100vh-3.5rem)]',
            )}>
            <CommentsSidebar
              scriptId={script.id}
              currentUserId={currentUserId}
              title={script.title}
              synopsis={script.synopsis ?? null}
              logline={script.logline ?? null}
              coverUrl={coverUrl ?? null}
            />
          </div>

          {/* Comments — mobile sheet */}
          <div className='lg:hidden'>
            <CommentsSheet scriptId={script.id} currentUserId={currentUserId} />
          </div>
        </div>
      ) : (
        /* No PDF state */
        <div className='flex-1 max-w-4xl mx-auto w-full px-5 py-12'>
          {script.synopsis && (
            <div className='mb-10'>
              <h2 className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider mb-3'>
                Sinopse
              </h2>
              <p className='text-body-default text-text-primary leading-relaxed'>{script.synopsis}</p>
            </div>
          )}

          <div className='rounded-sm border border-border-subtle bg-surface p-8 flex flex-col items-center gap-4 text-center'>
            <Film className='w-12 h-12 text-text-muted' />
            <p className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider'>
              PDF não disponível
            </p>
            <p className='text-body-small text-text-secondary max-w-sm'>
              O arquivo deste roteiro não está disponível para leitura no momento.
            </p>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {isOwner && (
        <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir roteiro</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o roteiro <strong>{script.title}</strong>? Esta ação não pode ser
                desfeita e todos os arquivos associados serão removidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className='bg-state-error hover:bg-state-error/90 text-white'
                disabled={isDeleting}
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete()
                }}>
                {isDeleting ? 'Excluindo...' : 'Excluir Roteiro'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
