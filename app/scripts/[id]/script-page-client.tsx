'use client'

import { CommentsSidebar } from '@/components/pdf-viewer/comments-sidebar'
import { PDFViewer } from '@/components/pdf-viewer'
import type { TagVariant } from '@/components/ui/tag'
import { Tag } from '@/components/ui/tag'
import { StarRating } from '@/components/ui/star-rating'
import type { AppRouter } from '@/server/api/root'
import type { inferRouterOutputs } from '@trpc/server'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
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
  currentUserId: string | null
}

export default function ScriptPageClient({ script, pdfUrl, currentUserId }: Props) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()

  const averageOpts = trpc.ratings.getAverage.queryOptions({ scriptId: script?.id ?? '' })
  const userRatingOpts = trpc.ratings.getUserRating.queryOptions(
    { scriptId: script?.id ?? '', userId: currentUserId ?? '' },
  )

  const { data: ratingData } = useQuery({ ...averageOpts, enabled: !!script })
  const { data: userRating } = useQuery({ ...userRatingOpts, enabled: !!script && !!currentUserId })

  const upsertRating = useMutation(trpc.ratings.upsert.mutationOptions())

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
    <div className='h-screen bg-bg-base flex flex-col overflow-hidden'>
      {/* Script header */}
      <div className='max-w-6xl mx-auto w-full px-5 py-8'>
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-2 flex-wrap'>
            {script.genre && <Tag variant={genreVariant}>{script.genre}</Tag>}
            {script.age_rating && <Tag variant='default'>{script.age_rating}</Tag>}
          </div>

          <h1 className='font-display text-heading-1 text-text-primary'>{script.title}</h1>

          {script.logline && (
            <p className='text-body-large text-text-secondary max-w-3xl'>{script.logline}</p>
          )}

          {script.author && (
            <p className='font-mono text-label-mono-default text-text-muted'>
              por{' '}
              <a
                href={`/profile/${script.author.id}`}
                className='text-text-secondary hover:text-brand-accent transition-colors'
              >
                {script.author.name}
              </a>
            </p>
          )}

          {/* RatingBox — ref: Figma 38:123 */}
          {isOwner ? (
            <div
              className='flex items-center gap-2 h-[29px] px-2 bg-elevated rounded-sm border border-border-subtle w-fit'
              aria-live='polite'
            >
              <StarRating value={ratingData?.average ?? 0} readOnly allowHalf />
              {ratingData && ratingData.total > 0 && (
                <span className='font-mono text-label-mono-small text-text-secondary whitespace-nowrap'>
                  {ratingData.average.toFixed(1)}{' '}
                  <span className='text-text-muted'>({ratingData.total})</span>
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
                readOnly={!currentUserId}
                onChange={(score) => {
                  if (!currentUserId) {
                    router.push('/auth/login')
                    return
                  }
                  upsertRating.mutate(
                    { scriptId: script.id, score: Math.round(score) },
                    {
                      onSuccess: () => {
                        void queryClient.invalidateQueries(averageOpts)
                        void queryClient.invalidateQueries(userRatingOpts)
                      },
                      onError: (err) => {
                        toast.error(err.message)
                      },
                    },
                  )
                }}
              />
              {ratingData && ratingData.total > 0 && (
                <span className='font-mono text-label-mono-small text-text-secondary whitespace-nowrap'>
                  {ratingData.average.toFixed(1)}{' '}
                  <span className='text-text-muted'>({ratingData.total})</span>
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

      {/* Reader — PDF + sidebar */}
      {pdfUrl ? (
        <div className='flex flex-col lg:flex-row flex-1 min-h-0 border-t border-border-subtle'>
          {/* PDF area */}
          <div className='flex-1 min-w-0 min-h-0 p-5 overflow-auto'>
            <PDFViewer url={pdfUrl} />
          </div>

          {/* Comments sidebar (ref: Figma 51:1007) */}
          <CommentsSidebar scriptId={script.id} currentUserId={currentUserId} />
        </div>
      ) : (
        /* Fallback: synopsis when no PDF available */
        <div className='max-w-4xl mx-auto w-full px-5 pb-12'>
          {script.synopsis && (
            <div className='mb-10'>
              <h2 className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs mb-3'>
                Synopsis
              </h2>
              <p className='text-body-default text-text-primary leading-relaxed whitespace-pre-wrap'>
                {script.synopsis}
              </p>
            </div>
          )}

          {script.script_files?.[0] && (
            <div className='rounded-sm border border-border-subtle bg-surface p-6'>
              <h2 className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs mb-4'>
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
    </div>
  )
}
