'use client'

import { Avatar } from '@/components/avatar'
import { ReactionBar } from '@/components/comments/reaction-bar'
import { Button } from '@/components/ui/button'
import { REACTION_EMOJIS, type ReactionEmoji } from '@/lib/constants/reactions'
import { useCommentActions } from '@/lib/hooks/use-comment-actions'
import type { CommentWithAuthor, ReactionSummary } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatPublishedDate } from '@/lib/utils/format-date'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { usePDFViewerStore } from './pdf-viewer-store'

type Tab = 'comments' | 'about'

interface CommentsSidebarProps {
  scriptId: string
  currentUserId: string | null
  title?: string | null
  synopsis?: string | null
  logline?: string | null
  coverUrl?: string | null
}

function buildReactionBarItems(commentId: string, reactionsMap: Record<string, ReactionSummary[]>) {
  const commentReactions = reactionsMap[commentId] ?? []
  return REACTION_EMOJIS.map((emoji) => {
    const found = commentReactions.find((r) => r.emoji === emoji)
    return {
      icon: emoji,
      label: emoji,
      count: found?.count ?? 0,
      active: found?.userReacted ?? false,
    }
  })
}

export function CommentsSidebar({ scriptId, currentUserId, title, synopsis, logline, coverUrl }: CommentsSidebarProps) {
  const { currentPage } = usePDFViewerStore()
  const trpc = useTRPC()
  const [content, setContent] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('comments')

  const { data: comments = [] } = useQuery({
    ...trpc.comments.list.queryOptions({ scriptId, pageNumber: currentPage }),
    enabled: !!currentPage,
  })

  const { data: reactionsMap = {} } = useQuery({
    ...trpc.comments.listReactionsByPage.queryOptions({
      scriptId,
      pageNumber: currentPage,
      currentUserId: currentUserId ?? undefined,
    }),
    enabled: !!currentPage,
  })

  const { createComment, toggleReaction, isCreating, isToggling } = useCommentActions(scriptId, currentUserId)

  const hasAboutContent = !!(synopsis || logline)

  return (
    <aside className='flex flex-col h-full bg-surface min-h-[calc(100vh-80px) pb-28]'>
      {/* Tab navigation */}
      <div className='flex shrink-0 border-b border-border-subtle'>
        {(['comments', 'about'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={tab === 'about' && !hasAboutContent}
            className={cn(
              'flex-1 py-3 font-mono text-label-mono-small transition-colors border-b-2 -mb-px touch-manipulation',
              activeTab === tab
                ? 'text-text-primary border-brand-accent'
                : 'text-text-muted border-transparent hover:text-text-secondary',
              tab === 'about' && !hasAboutContent && 'opacity-40 cursor-not-allowed',
            )}>
            {tab === 'comments' ? 'Comentários' : 'Sobre'}
          </button>
        ))}
      </div>

      {/* Comments tab */}
      {activeTab === 'comments' && (
        <div className='flex flex-col flex-1 min-h-0'>
          {/* Page indicator */}
          <div className='px-5 pt-4 pb-2 shrink-0'>
            <p className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider'>
              Página {currentPage}
            </p>
          </div>

          {/* Comments list — scrollable */}
          <div className='flex-1 min-h-0 overflow-y-auto px-5 py-2 flex flex-col gap-3'>
            {(comments as CommentWithAuthor[]).map((c) => (
              <div key={c.id} className='bg-elevated rounded-sm p-3 border border-border-subtle flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  {c.author?.id ? (
                    <Link href={`/profile/${c.author.id}`} className='shrink-0 hover:opacity-80 transition-opacity'>
                      <Avatar src={c.author.image} name={c.author.name ?? '?'} size='md' />
                    </Link>
                  ) : (
                    <Avatar name='?' size='md' />
                  )}
                  {c.author?.id ? (
                    <Link
                      href={`/profile/${c.author.id}`}
                      className='text-text-primary text-body-small font-medium truncate hover:text-brand-accent transition-colors'>
                      {c.author.name ?? 'Anônimo'}
                    </Link>
                  ) : (
                    <span className='text-text-primary text-body-small font-medium truncate'>
                      {c.author?.name ?? 'Anônimo'}
                    </span>
                  )}
                  <span className='font-mono text-label-mono-small text-text-muted ml-auto shrink-0'>
                    {c.created_at ? formatPublishedDate(c.created_at) : '—'}
                  </span>
                </div>
                <p className='text-text-secondary text-body-small leading-relaxed'>{c.content}</p>
                <ReactionBar
                  disabled={c.author?.id === currentUserId}
                  loading={isToggling}
                  reactions={buildReactionBarItems(c.id, reactionsMap)}
                  onSelect={(index) => toggleReaction(c.id, REACTION_EMOJIS[index] as ReactionEmoji, currentPage)}
                />
              </div>
            ))}

            {comments.length === 0 && (
              <p className='text-text-muted text-body-small py-4'>Nenhum comentário nesta página ainda.</p>
            )}
          </div>

          {/* Comment input — pinned to bottom */}
          <div className='shrink-0 border-t border-border-subtle px-5 pt-4 pb-5'>
            {currentUserId ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  await createComment(currentPage, content)
                  setContent('')
                }}
                className='flex flex-col gap-2'>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder='Comente nesta página…'
                  rows={3}
                  maxLength={1000}
                  className='w-full rounded-sm border border-border-subtle bg-elevated p-3 text-body-small text-text-primary resize-none focus:outline-none focus:ring-1 focus:ring-brand-accent placeholder:text-text-muted'
                />
                <Button type='submit' size='sm' disabled={isCreating || !content.trim()}>
                  {isCreating ? 'Enviando…' : 'Enviar'}
                </Button>
              </form>
            ) : (
              <p className='text-text-muted text-body-small'>
                <a href='/auth/login' className='text-brand-accent underline underline-offset-4'>
                  Entre
                </a>{' '}
                para deixar um comentário.
              </p>
            )}
          </div>
        </div>
      )}

      {/* About tab */}
      {activeTab === 'about' && hasAboutContent && (
        <div className='flex-1 overflow-y-auto p-5 flex flex-col gap-2'>
          {coverUrl && (
            <div>
              <h3 className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider'>Capa</h3>
              <div className='aspect-[4/5] h-full max-h-[280px] w-fit overflow-hidden rounded-sm bg-bg-elevated relative flex items-center justify-center border-b border-border-subtle/50 group-hover:border-brand-accent/30 transition-colors'>
                <Image
                  src={coverUrl}
                  alt='Capa do roteiro'
                  width={400}
                  height={600}
                  className='rounded-sm border border-border-subtle w-full h-full object-cover transition-transform duration-300 hover:scale-105'
                />
              </div>
            </div>
          )}
          {title && (
            <div>
              <h3 className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider'>Título</h3>
              <h3 className='font-display text-heading-3 text-text-primary leading-tight line-clamp-2'>{title}</h3>
            </div>
          )}
          {logline && (
            <div>
              <h3 className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider'>Logline</h3>
              <p className='text-body-default text-text-secondary leading-relaxed'>{logline}</p>
            </div>
          )}
          {synopsis && (
            <div>
              <h3 className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider'>Sinopse</h3>
              <p className='text-body-default text-text-secondary leading-relaxed'>{synopsis}</p>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
