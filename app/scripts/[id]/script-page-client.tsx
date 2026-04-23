'use client'

import { AudioPlayer } from '@/components/audio-player'
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
        // Invalidate lists where this script might appear
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
      <div className='min-h-screen bg-bg-base flex items-center justify-center'>
        <p className='text-state-error font-mono text-label-mono-default'>Script not found.</p>
      </div>
    )
  }

  const genreVariant: TagVariant = GENRE_VARIANT_MAP[script.genre ?? ''] ?? 'default'
  const isOwner = !!currentUserId && currentUserId === script.author?.id

  return (
    <div className='bg-bg-base flex flex-col'>
      {/* Banner */}
      {bannerUrl && (
        <div className='w-full h-48 md:h-64 absolute overflow-hidden'>
          <Image
            src={bannerUrl}
            alt={script.title}
            fill
            priority
            className='object-cover object-center opacity-20'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-bg-base to-transparent' />
        </div>
      )}

      {/* Script header */}
      <div className={cn('max-w-6xl mx-auto w-full px-5 pb-8', !bannerUrl ? 'pt-8' : 'pt-24 relative z-10')}>
        <div className='flex flex-col md:flex-row gap-6 md:gap-8'>
          {/* Cover on Details Page */}
          <div className='w-32 md:w-40 shrink-0 aspect-[2/3] rounded-sm bg-elevated border border-border-subtle overflow-hidden relative shadow-lg'>
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={script.title}
                fill
                className='object-cover'
              />
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
              <h1 className='font-display text-heading-2 md:text-heading-1 text-text-primary leading-tight'>{script.title}</h1>

              {isOwner && (
                <div className='flex items-center gap-2 mt-1 shrink-0'>
                  <Link
                    href={`/publish?id=${script.id}`}
                    className='flex items-center gap-1.5 px-3 h-8 rounded-sm border border-border-subtle text-text-secondary font-sans text-[12px] hover:border-border-default transition-colors'
                  >
                    <Pencil className='w-3.5 h-3.5' />
                    Editar
                  </Link>
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className='flex items-center gap-1.5 px-3 h-8 rounded-sm border border-state-error/20 text-state-error font-sans text-[12px] hover:bg-state-error/10 transition-colors'
                  >
                    <Trash2 className='w-3.5 h-3.5' />
                    Excluir
                  </button>
                </div>
              )}
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

            {/* RatingBox — ref: Figma 38:123 */}
            {isOwner ? (
              <div
                className='flex items-center gap-2 h-[29px] px-2 bg-elevated rounded-sm border border-border-subtle w-fit'
                aria-live='polite'>
                <StarRating value={ratingData?.average ?? 0} readOnly allowHalf />
                {ratingData && ratingData.total > 0 && (
                  <span className='font-mono text-label-mono-small text-text-secondary whitespace-nowrap'>
                    {ratingData.average.toFixed(1)} <span className='text-text-muted'>({ratingData.total})</span>
                  </span>
                )}
                <span className='font-mono text-label-mono-small text-text-muted'>
                  Você não pode avaliar seu próprio roteiro
                </span>
              </div>
            ) : (
              <div className='flex items-center gap-2 h-[29px] px-2 bg-elevated rounded-sm border border-border-subtle w-fit'>
                <StarRating
                  value={userRating ?? ratingData?.average ?? 0}
                  allowHalf={!currentUserId}
                  readOnly={!currentUserId || isRatingPending}
                  onChange={rate}
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
            )}
          </div>
        </div>
      </div>


      {/* Audio player */}
      {audioUrl && (
        <div className='max-w-6xl mx-auto w-full px-5 pb-4'>
          <AudioPlayer src={audioUrl} className='max-w-sm' />
        </div>
      )}

      {/* Reader — PDF + sidebar */}
      {pdfUrl ? (
        <div className='flex flex-col lg:flex-row flex-1 min-h-0 border-t border-border-subtle max-h-[90vh]'>
          {/* PDF area */}
          <div className='flex-1 min-w-0 p-5 overflow-auto min-h-[90vh]'>
            <PDFViewer url={pdfUrl} />
          </div>

          {/* Comments sidebar (ref: Figma 51:1007) */}
          <CommentsSidebar scriptId={script.id} currentUserId={currentUserId} />
        </div>
      ) : (
        /* Fallback: synopsis when no PDF available */
        <div className='max-w-4xl mx-auto w-full px-5 pb-12 h-full'>
          {script.synopsis && (
            <div className='mb-10'>
              <h2 className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider mb-3'>
                Synopsis
              </h2>
              <p className='text-body-default text-text-primary leading-relaxed whitespace-pre-wrap'>
                {script.synopsis}
              </p>
            </div>
          )}

          {script.script_files?.[0] && (
            <div className='rounded-sm border border-border-subtle bg-surface p-6'>
              <h2 className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider mb-4'>
                Script File
              </h2>
              <div className='flex flex-col gap-2'>
                {script.script_files[0].page_count && (
                  <p className='text-sm text-text-secondary'>
                    <span className='text-text-muted'>Pages: </span>
                    {script.script_files[0].page_count}
                  </p>
                )}
                {script.script_files[0].file_size && (
                  <p className='text-sm text-text-secondary'>
                    <span className='text-text-muted'>Size: </span>
                    {(script.script_files[0].file_size / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isOwner && (
        <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir roteiro</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o roteiro <strong>{script.title}</strong>? Esta ação não pode ser desfeita e todos os arquivos associados serão removidos.
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
