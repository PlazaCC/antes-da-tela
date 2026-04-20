'use client'

import { Avatar } from '@/components/avatar'
import { Button } from '@/components/ui/button'
import { ReactionBar } from '@/components/comments/reaction-bar'
import { REACTION_EMOJIS, type ReactionEmoji } from '@/lib/constants/reactions'
import type { CommentWithAuthor, ReactionSummary } from '@/server/api/comments'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { usePDFViewerStore } from './pdf-viewer-store'

interface CommentsSidebarProps {
  scriptId: string
  currentUserId: string | null
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

export function CommentsSidebar({ scriptId, currentUserId }: CommentsSidebarProps) {
  const { currentPage } = usePDFViewerStore()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')

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

  const createComment = useMutation(trpc.comments.create.mutationOptions())

  const toggleReaction = useMutation(trpc.comments.toggleReaction.mutationOptions())

  const handleToggleReaction = (commentId: string, emoji: ReactionEmoji) => {
    if (!currentUserId) {
      toast.error('Log in to react to comments.')
      return
    }
    const page = currentPage
    toggleReaction.mutate(
      { commentId, emoji },
      {
        onSuccess: () => {
          // Invalidate reactions (counts/userReacted) and comment list (ordering may change)
          void queryClient.invalidateQueries({
            queryKey: trpc.comments.listReactionsByPage.queryOptions({
              scriptId,
              pageNumber: page,
              currentUserId: currentUserId ?? undefined,
            }).queryKey,
          })
          void queryClient.invalidateQueries({
            queryKey: trpc.comments.list.queryOptions({ scriptId, pageNumber: page }).queryKey,
          })
        },
        onError: (err) => {
          toast.error(err.message)
        },
      },
    )
  }

  return (
    <aside className='flex flex-col gap-4 w-full lg:w-[400px] shrink-0 bg-surface border-l border-border-subtle p-5 min-h-full'>
      <p className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider'>Page {currentPage}</p>

      <div className='flex flex-col gap-3 flex-1 overflow-y-auto'>
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
                  {c.author.name ?? 'Anonymous'}
                </Link>
              ) : (
                <span className='text-text-primary text-body-small font-medium truncate'>
                  {c.author?.name ?? 'Anonymous'}
                </span>
              )}
              <span className='font-mono text-label-mono-small text-text-muted ml-auto shrink-0'>
                {c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—'}
              </span>
            </div>
            <p className='text-text-secondary text-body-small leading-relaxed'>{c.content}</p>
            <div>
              <ReactionBar
                disabled={c.author?.id === currentUserId}
                loading={toggleReaction.isPending}
                reactions={buildReactionBarItems(c.id, reactionsMap)}
                onSelect={(index) => handleToggleReaction(c.id, REACTION_EMOJIS[index] as ReactionEmoji)}
              />
            </div>
          </div>
        ))}

        {comments.length === 0 && <p className='text-text-muted text-body-small'>No comments on this page yet.</p>}
      </div>

      {currentUserId ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const trimmed = content.trim()
            if (!trimmed) return
            const submittedPage = currentPage
            createComment.mutate(
              { scriptId, pageNumber: submittedPage, content: trimmed },
              {
                onSuccess: () => {
                  void queryClient.invalidateQueries({
                    queryKey: trpc.comments.list.queryOptions({ scriptId, pageNumber: submittedPage }).queryKey,
                  })
                  setContent('')
                },
                onError: (err) => {
                  toast.error(err.message)
                },
              },
            )
          }}
          className='flex flex-col gap-2 border-t border-border-subtle pt-4'>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='Comment on this page…'
            rows={3}
            maxLength={1000}
            className='w-full rounded-sm border border-border-subtle bg-elevated p-3 text-body-small text-text-primary resize-none focus:outline-none focus:ring-1 focus:ring-brand-accent placeholder:text-text-muted'
          />
          <Button type='submit' size='sm' disabled={createComment.isPending || !content.trim()}>
            {createComment.isPending ? 'Posting…' : 'Comment'}
          </Button>
        </form>
      ) : (
        <p className='text-text-muted text-body-small border-t border-border-subtle pt-4'>
          <a href='/auth/login' className='text-brand-accent underline underline-offset-4'>
            Log in
          </a>{' '}
          to leave a comment.
        </p>
      )}
    </aside>
  )
}
