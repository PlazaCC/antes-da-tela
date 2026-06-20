'use client'

import { AudioPlayer, type AudioTrack } from '@/components/audio-player'
import { CommentsSheet } from '@/components/comments/comments-sheet'
import { PDFViewer } from '@/components/pdf-viewer'
import { PdfFullscreenDialog } from '@/components/pdf-viewer/pdf-fullscreen-dialog'
import { CommentsSidebar } from '@/components/pdf-viewer/comments-sidebar'
import { ScriptReadingBar } from '@/components/script-page/script-reading-bar'
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
  audios: AudioTrack[]
  bannerUrl: string | null
  coverUrl: string | null
  pitchDeckUrl: string | null
  currentUserId: string | null
}

export function ScriptPageClient({ script, pdfUrl, audios, coverUrl, pitchDeckUrl, currentUserId }: Props) {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [pitchDeckOpen, setPitchDeckOpen] = useState(false)

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
  const hasAudio = audios.length > 0

  const handleDeleteTrigger = () => setDeleteModalOpen(true)

  return (
    <div
      className={cn('bg-bg-base flex flex-col min-h-dvh', hasAudio && 'pb-[calc(54px+env(safe-area-inset-bottom))]')}>
      {/* Breadcrumbs */}
      <div className='flex items-center gap-2 px-5 py-3 border-b border-border-subtle bg-bg-base'>
        <Link
          href='/feed'
          className='font-mono text-label-mono-small text-text-muted hover:text-text-primary transition-colors'>
          ← Início
        </Link>
        <span className='text-text-muted font-mono text-label-mono-small'>/</span>
        <span className='font-mono text-label-mono-small text-text-secondary truncate max-w-[140px] md:max-w-[280px]'>
          {script.title}
        </span>
      </div>

      {/* Slim reading header — focus stays on the script + comments */}
      <ScriptReadingBar
        scriptId={script.id}
        title={script.title}
        author={script.author}
        genre={script.genre}
        genreVariant={genreVariant}
        subgenres={script.subgenres}
        ageRating={script.age_rating}
        isOwner={isOwner}
        currentUserId={currentUserId}
        ratingData={ratingData}
        userRating={userRating}
        isRatingPending={isRatingPending}
        onRate={rate}
        onDelete={handleDeleteTrigger}
        pitchDeckUrl={pitchDeckUrl}
        onOpenPitchDeck={() => setPitchDeckOpen(true)}
      />

      {/* Audio player — fixed bottom bar with track selector (Spotify-style) */}
      {hasAudio && <AudioPlayer audios={audios} title={script.title} />}

      {/* Reader — 25/50/25 grid; left col reserved, center PDF, right comments */}
      {pdfUrl ? (
        <div className='flex flex-col lg:flex-row border-t border-border-subtle'>
          {/* Left column — reserved, no functionality for now */}
          <div className='hidden lg:block lg:w-1/4 border-r border-border-subtle' />

          {/* PDF column — center 50% */}
          <div className='flex-1 min-w-0 lg:w-1/2 min-h-[60vh]'>
            <PDFViewer url={pdfUrl} syncToStore />
          </div>

          {/* Comments sidebar — right 25%, fills viewport below navbar */}
          <div
            className={cn(
              'hidden lg:flex flex-col lg:w-1/4 border-l border-border-subtle sticky top-14 self-start',
              hasAudio ? 'h-[calc(100vh-3.5rem-54px)]' : 'h-[calc(100vh-3.5rem)]',
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

      {/* Pitch Deck — full-screen modal reader */}
      {pitchDeckUrl && (
        <PdfFullscreenDialog
          open={pitchDeckOpen}
          onOpenChange={setPitchDeckOpen}
          url={pitchDeckUrl}
          title={`Pitch Deck — ${script.title}`}
        />
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
