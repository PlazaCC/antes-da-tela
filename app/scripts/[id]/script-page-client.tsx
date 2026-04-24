'use client'

import { AudioPlayer } from '@/components/audio-player'
import { CommentsSheet } from '@/components/comments/comments-sheet'
import { PDFViewer } from '@/components/pdf-viewer'
import { CommentsSidebar } from '@/components/pdf-viewer/comments-sidebar'
import { StarRating } from '@/components/star-rating/star-rating'
import type { TagVariant } from '@/components/tag/tag'
import { Tag } from '@/components/tag/tag'
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
import { Film, Pencil, Trash2 } from 'lucide-react'
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

  const ownerActions = isOwner ? (
    <div className='flex items-center gap-2 shrink-0'>
      <Link
        href={`/publish?id=${script.id}`}
        className='flex items-center gap-1.5 px-3 h-9 min-h-[44px] md:min-h-0 md:h-8 rounded-sm border border-border-subtle text-text-secondary font-sans text-[12px] hover:border-border-default transition-colors touch-manipulation'>
        <Pencil className='w-3.5 h-3.5' />
        Editar
      </Link>
      <button
        onClick={() => setDeleteModalOpen(true)}
        className='flex items-center gap-1.5 px-3 h-9 min-h-[44px] md:min-h-0 md:h-8 rounded-sm border border-state-error/20 text-state-error font-sans text-[12px] hover:bg-state-error/10 transition-colors touch-manipulation'>
        <Trash2 className='w-3.5 h-3.5' />
        Excluir
      </button>
    </div>
  ) : null

  return (
    <div
      className={cn(
        'bg-bg-base flex flex-col min-h-dvh',
        audioUrl && 'pb-[calc(54px+env(safe-area-inset-bottom))]',
      )}>
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
        {bannerUrl ? (
          /* When banner is present: compact metadata row (no cover, no duplicate title) */
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between gap-4 flex-wrap'>
              <div className='flex items-center gap-2 flex-wrap'>
                {script.genre && <Tag variant={genreVariant}>{script.genre}</Tag>}
                {script.age_rating && <Tag variant='default'>{script.age_rating}</Tag>}
              </div>
              {ownerActions}
            </div>
            {script.author && (
              <p className='font-mono text-label-mono-default text-text-muted'>
                por{' '}
                <a
                  href={`/profile/${script.author.id}`}
                  className='text-text-secondary hover:text-brand-accent transition-colors'>
                  {script.author.name}
                </a>
              </p>
            )}
            <RatingBox
              isOwner={isOwner}
              ratingData={ratingData}
              userRating={userRating}
              isRatingPending={isRatingPending}
              currentUserId={currentUserId}
              onRate={rate}
            />
          </div>
        ) : (
          /* When no banner: full metadata layout with cover */
          <div className='flex flex-col md:flex-row gap-6 md:gap-8'>
            <div className='w-28 md:w-36 shrink-0 aspect-[4/5] rounded-sm bg-elevated border border-border-subtle overflow-hidden relative shadow-lg'>
              {coverUrl ? (
                <Image src={coverUrl} alt={script.title} fill className='object-cover' />
              ) : (
                <div className='flex flex-col items-center justify-center h-full gap-2'>
                  <Film className='w-8 h-8 text-text-muted' />
                  <span className='font-mono text-[10px] text-text-muted uppercase'>Sem Capa</span>
                </div>
              )}
            </div>

            <div className='flex flex-col gap-4 flex-1 min-w-0'>
              <div className='flex items-center gap-2 flex-wrap'>
                {script.genre && <Tag variant={genreVariant}>{script.genre}</Tag>}
                {script.age_rating && <Tag variant='default'>{script.age_rating}</Tag>}
              </div>

              <div className='flex items-start justify-between gap-4'>
                <h1 className='font-display text-heading-2 md:text-heading-1 text-text-primary leading-tight'>
                  {script.title}
                </h1>
                {ownerActions}
              </div>

              {script.logline && <p className='text-body-large text-text-secondary max-w-3xl'>{script.logline}</p>}

              {script.author && (
                <p className='font-mono text-label-mono-default text-text-muted'>
                  por{' '}
                  <a
                    href={`/profile/${script.author.id}`}
                    className='text-text-secondary hover:text-brand-accent transition-colors'>
                    {script.author.name}
                  </a>
                </p>
              )}

              <RatingBox
                isOwner={isOwner}
                ratingData={ratingData}
                userRating={userRating}
                isRatingPending={isRatingPending}
                currentUserId={currentUserId}
                onRate={rate}
              />
            </div>
          </div>
        )}
      </div>

      {/* Synopsis — visible above the reader when PDF is present */}
      {pdfUrl && script.synopsis && (
        <div className='max-w-6xl mx-auto w-full px-5 pb-6 border-t border-border-subtle pt-6'>
          <h3 className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider mb-3'>Sinopse</h3>
          <p className='text-body-default text-text-secondary leading-relaxed max-w-3xl'>{script.synopsis}</p>
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
              synopsis={script.synopsis ?? null}
              logline={script.logline ?? null}
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
              <p className='text-body-default text-text-primary leading-relaxed whitespace-pre-wrap'>
                {script.synopsis}
              </p>
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

interface RatingBoxProps {
  isOwner: boolean
  ratingData: { average: number; total: number } | undefined
  userRating: number | null | undefined
  isRatingPending: boolean
  currentUserId: string | null
  onRate: (value: number) => void
}

function RatingBox({ isOwner, ratingData, userRating, isRatingPending, currentUserId, onRate }: RatingBoxProps) {
  if (isOwner) {
    return (
      <div
        className='flex items-center gap-2 h-[29px] px-2 bg-elevated rounded-sm border border-border-subtle w-fit'
        aria-live='polite'>
        <StarRating value={ratingData?.average ?? 0} readOnly allowHalf />
        {ratingData && ratingData.total > 0 && (
          <span className='font-mono text-label-mono-small text-text-secondary whitespace-nowrap'>
            {ratingData.average.toFixed(1)} <span className='text-text-muted'>({ratingData.total})</span>
          </span>
        )}
        <span className='font-mono text-label-mono-small text-text-muted hidden md:inline'>
          Você não pode avaliar seu próprio roteiro
        </span>
      </div>
    )
  }

  return (
    <div className='flex items-center gap-2 h-[29px] px-2 bg-elevated rounded-sm border border-border-subtle w-fit'>
      <StarRating
        value={userRating ?? ratingData?.average ?? 0}
        allowHalf={!currentUserId}
        readOnly={!currentUserId || isRatingPending}
        onChange={onRate}
      />
      {ratingData && ratingData.total > 0 && (
        <span className='font-mono text-label-mono-small text-text-secondary whitespace-nowrap'>
          {ratingData.average.toFixed(1)} <span className='text-text-muted'>({ratingData.total})</span>
        </span>
      )}
      {!currentUserId && (
        <span className='font-mono text-label-mono-small text-text-muted'>
          <a href='/auth/login' className='text-brand-accent hover:underline'>
            Avaliar
          </a>
        </span>
      )}
    </div>
  )
}
