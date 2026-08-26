'use client'

import { AudioPlayer, type AudioTrack } from '@/components/audio-player'
import { CommentsSheet } from '@/components/comments/comments-sheet'
import {
  PdfCanvas,
  PdfControls,
  PdfViewerProvider,
} from '@/components/pdf-viewer'
import { CommentsSidebar } from '@/components/pdf-viewer/comments-sidebar'
import { PdfFullscreenDialog } from '@/components/pdf-viewer/pdf-fullscreen-dialog'
import { ScriptPageSubHeader } from '@/components/script-page/script-page-sub-header'
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
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AppRouter } from '@/server/api/root'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { inferRouterOutputs } from '@trpc/server'
import { Film, MessageCircleMore } from 'lucide-react'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import { useState } from 'react'
import { toast } from 'sonner'

type RouterOutput = inferRouterOutputs<AppRouter>
type ScriptDetail = RouterOutput['scripts']['getById']

interface Props {
  script: ScriptDetail
  pdfUrl: string | null
  audios: AudioTrack[]
  bannerUrl: string | null
  coverUrl: string | null
  pitchDeckUrl: string | null
  currentUserId: string | null
}

export function ScriptPageClient({
  script,
  pdfUrl,
  audios,
  pitchDeckUrl,
  currentUserId,
}: Props) {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [pitchDeckOpen, setPitchDeckOpen] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(true)

  const deleteMutation = useMutation(
    trpc.scripts.delete.mutationOptions({
      onSuccess: () => {
        posthog.capture('script_deleted', { script_id: script!.id })
        toast.success('Roteiro excluído com sucesso')
        queryClient.invalidateQueries(trpc.scripts.listFeatured.queryFilter())
        queryClient.invalidateQueries(trpc.scripts.listRecent.queryFilter())
        queryClient.invalidateQueries(
          trpc.scripts.listByAuthor.queryFilter({
            authorId: currentUserId ?? '',
          })
        )
        router.push('/profile/dashboard')
      },
      onError: (error) =>
        toast.error('Erro ao excluir roteiro: ' + error.message),
      onSettled: () => {
        setIsDeleting(false)
        setDeleteModalOpen(false)
      },
    })
  )

  // ---- Rating ----
  const { data: ratingData } = useQuery(
    trpc.ratings.getAverage.queryOptions({ scriptId: script!.id })
  )

  const { data: userRating } = useQuery({
    ...trpc.ratings.getUserRating.queryOptions({
      scriptId: script!.id,
      userId: currentUserId ?? '',
    }),
    enabled: !!currentUserId,
  })

  const rateMutation = useMutation(
    trpc.ratings.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.ratings.getAverage.queryFilter({ scriptId: script!.id })
        )
        queryClient.invalidateQueries(
          trpc.ratings.getUserRating.queryFilter({
            scriptId: script!.id,
            userId: currentUserId ?? '',
          })
        )
      },
      onError: (error) => toast.error('Erro ao avaliar: ' + error.message),
    })
  )

  const handleRate = (value: number) => {
    rateMutation.mutate({ scriptId: script!.id, score: value })
    posthog.capture('script_rated', { script_id: script!.id, score: value })
  }

  const handleDelete = () => {
    setIsDeleting(true)
    deleteMutation.mutate({ id: script!.id })
  }

  if (!script) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-base">
        <p className="font-mono text-label-mono-default text-state-error">
          Roteiro não encontrado.
        </p>
      </div>
    )
  }

  const isOwner = !!currentUserId && currentUserId === script.author?.id
  const hasAudio = audios.length > 0

  const subHeaderProps = {
    scriptId: script!.id,
    title: script!.title,
    isOwner,
    hasPitchDeck: !!pitchDeckUrl,
    isDeleting,
    onOpenPitchDeck: () => {
      setPitchDeckOpen(true)
      posthog.capture('pitch_deck_opened', { script_id: script!.id })
    },
    onDelete: () => setDeleteModalOpen(true),
    rating: {
      isOwner,
      ratingData: ratingData ?? undefined,
      userRating: userRating ?? null,
      isRatingPending: rateMutation.isPending,
      currentUserId,
      onRate: handleRate,
    },
  }

  return (
    // Full viewport below the global navbar (h-14); only inner regions scroll.
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-bg-base">
      {pdfUrl ? (
        <PdfViewerProvider url={pdfUrl} syncToStore>
          <ScriptPageSubHeader
            {...subHeaderProps}
            extra={
              <PdfControls className="static border-b-0 bg-transparent p-0 backdrop-blur-none" />
            }
          />

          {/* Main — the only area that grows; PDF + comments scroll internally */}
          <div className="relative flex min-h-0 flex-1 justify-center">
            <PdfCanvas className="h-full w-full lg:w-1/2" />

            {/* Floating toggle — stays put so the panel can be reopened when closed */}
            <Button
              variant="secondary"
              size="icon-sm"
              className="absolute right-4 top-4 z-30 hidden rounded-full shadow-md lg:inline-flex"
              aria-pressed={commentsOpen}
              aria-label={
                commentsOpen ? 'Fechar comentários' : 'Abrir comentários'
              }
              onClick={() => setCommentsOpen((open) => !open)}
            >
              <MessageCircleMore />
            </Button>

            {/* Comments — slides in/out from the right */}
            <aside
              aria-hidden={!commentsOpen}
              className={cn(
                'absolute right-0 top-0 z-40 hidden h-full min-h-0 w-[340px] shrink-0 overflow-hidden p-3 transition-transform duration-300 ease-in-out lg:block xl:w-1/4',
                commentsOpen ? 'translate-x-0' : 'translate-x-full'
              )}
            >
              <div className="h-full w-full overflow-hidden rounded-xl border border-border-subtle">
                <CommentsSidebar
                  scriptId={script.id}
                  currentUserId={currentUserId}
                  onClose={() => setCommentsOpen(false)}
                />
              </div>
            </aside>
          </div>
        </PdfViewerProvider>
      ) : (
        <>
          <ScriptPageSubHeader {...subHeaderProps} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-5 py-12 text-center">
              <Film className="h-12 w-12 text-text-muted" />
              <p className="font-mono text-label-mono-caps uppercase tracking-wider text-text-muted">
                PDF não disponível
              </p>
              <p className="max-w-sm text-body-small text-text-secondary">
                O arquivo deste roteiro não está disponível para leitura no
                momento.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Audio bar — controlled height, in-flow at the bottom */}
      {hasAudio && <AudioPlayer audios={audios} title={script.title} />}

      {/* Comments — mobile sheet (floating trigger + drawer) */}
      <div className="lg:hidden">
        <CommentsSheet scriptId={script.id} currentUserId={currentUserId} />
      </div>

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
                Tem certeza que deseja excluir o roteiro{' '}
                <strong>{script.title}</strong>? Esta ação não pode ser desfeita
                e todos os arquivos associados serão removidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-state-error text-white hover:bg-state-error/90"
                disabled={isDeleting}
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete()
                }}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir Roteiro'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
