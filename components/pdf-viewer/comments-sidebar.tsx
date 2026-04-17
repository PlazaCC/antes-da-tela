'use client'

import { Button } from '@/components/ui/button'
import type { CommentWithAuthor } from '@/server/api/comments'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { usePDFViewerStore } from './pdf-viewer-store'

interface CommentsSidebarProps {
  scriptId: string
  currentUserId: string | null
}

export function CommentsSidebar({ scriptId, currentUserId }: CommentsSidebarProps) {
  const { currentPage } = usePDFViewerStore()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')

  const { data: comments = [] } = useQuery(
    trpc.comments.list.queryOptions({ scriptId, pageNumber: currentPage }),
  )

  // Mutation without a global onSuccess — page is captured at submit time to avoid
  // stale closure: if the user navigates to a different page while the request is
  // in-flight, we still invalidate the page where the comment was actually posted.
  const createComment = useMutation(trpc.comments.create.mutationOptions())

  return (
    <aside className='flex flex-col gap-4 w-full lg:w-[400px] shrink-0 bg-surface border-l border-border-subtle p-5 min-h-full'>
      {/* Page header — DM Mono uppercase (ref: design spec) */}
      <p className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider'>
        Page {currentPage}
      </p>

      {/* Comment list (ref: Figma Comment 13:136) */}
      <div className='flex flex-col gap-3 flex-1 overflow-y-auto'>
        {(comments as CommentWithAuthor[]).map((c) => (
          <div
            key={c.id}
            className='bg-elevated rounded-sm p-3 border border-border-subtle flex flex-col gap-2'
          >
            <div className='flex items-center gap-2'>
              {/* Avatar (ref: Figma 38:115) — initials fallback */}
              <div className='w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-xs font-medium text-brand-accent shrink-0'>
                {c.author?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className='text-text-primary text-body-small font-medium truncate'>
                {c.author?.name ?? 'Anonymous'}
              </span>
              <span className='font-mono text-label-mono-small text-text-muted ml-auto shrink-0'>
                {new Date(c.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <p className='text-text-secondary text-body-small leading-relaxed'>{c.content}</p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className='text-text-muted text-body-small'>No comments on this page yet.</p>
        )}
      </div>

      {/* Comment form or login CTA */}
      {currentUserId ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const trimmed = content.trim()
            if (!trimmed) return
            // Capture pageNumber now so the invalidation targets the submitted page,
            // not whatever page the user has navigated to by the time onSuccess fires.
            const submittedPage = currentPage
            createComment.mutate(
              { scriptId, pageNumber: submittedPage, content: trimmed },
              {
                onSuccess: () => {
                  void queryClient.invalidateQueries(
                    trpc.comments.list.queryOptions({ scriptId, pageNumber: submittedPage }),
                  )
                  setContent('')
                },
              },
            )
          }}
          className='flex flex-col gap-2 border-t border-border-subtle pt-4'
        >
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
