'use client'

import { Avatar } from '@/components/avatar'
import { ReactionBar } from '@/components/comments/reaction-bar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { REACTION_EMOJIS, type ReactionEmoji } from '@/lib/constants/reactions'
import { useCommentActions } from '@/lib/hooks/use-comment-actions'
import type { CommentWithAuthor, ReactionSummary } from '@/lib/types'
import { formatPublishedDate } from '@/lib/utils/format-date'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { usePDFViewerStore } from './pdf-viewer-store'

interface CommentsSidebarProps {
  scriptId: string
  currentUserId: string | null
  onClose?: () => void
  hideClose?: boolean
}

function buildReactionBarItems(
  commentId: string,
  reactionsMap: Record<string, ReactionSummary[]>
) {
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

export function CommentsSidebar({
  scriptId,
  currentUserId,
  onClose,
  hideClose,
}: CommentsSidebarProps) {
  const { currentPage } = usePDFViewerStore()
  const trpc = useTRPC()
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

  const { createComment, toggleReaction, deleteComment, isCreating, isToggling, isDeleting } =
    useCommentActions(scriptId, currentUserId)

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-surface">
      {/* Page indicator */}
      <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-5 py-4 lg:py-2">
        <p className="font-mono text-label-mono-caps uppercase leading-4 tracking-wider text-text-secondary">
          Comentários · Página {currentPage}
        </p>
        {!hideClose && (
          <Button variant="ghost" size="icon-xs" onClick={onClose}>
            <X />
          </Button>
        )}
      </div>

      {/* Comments list — the only scrollable region */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-3">
        {(comments as CommentWithAuthor[]).map((c) => (
          <div
            key={c.id}
            className="flex flex-col gap-2 rounded-sm border border-border-subtle bg-elevated p-3"
          >
            <div className="flex items-center gap-2">
              {c.author?.id ? (
                <Link
                  href={`/profile/${c.author.id}`}
                  className="shrink-0 transition-opacity hover:opacity-80"
                >
                  <Avatar
                    src={c.author.image}
                    name={c.author.name ?? '?'}
                    size="md"
                  />
                </Link>
              ) : (
                <Avatar name="?" size="md" />
              )}
              {c.author?.id ? (
                <Link
                  href={`/profile/${c.author.id}`}
                  className="truncate text-body-small font-medium text-text-primary transition-colors hover:text-brand-accent"
                >
                  {c.author.name ?? 'Anônimo'}
                </Link>
              ) : (
                <span className="truncate text-body-small font-medium text-text-primary">
                  {c.author?.name ?? 'Anônimo'}
                </span>
              )}
              <span className="ml-auto shrink-0 font-mono text-label-mono-small text-text-muted">
                {c.created_at ? formatPublishedDate(c.created_at) : '—'}
              </span>
              {c.author?.id === currentUserId && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      disabled={isDeleting}
                      className="shrink-0 text-text-muted hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir comentário</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteComment(c.id, currentPage)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <p className="text-body-small leading-relaxed text-text-secondary">
              {c.content}
            </p>
            <ReactionBar
              disabled={c.author?.id === currentUserId}
              loading={isToggling}
              reactions={buildReactionBarItems(c.id, reactionsMap)}
              onSelect={(index) =>
                toggleReaction(
                  c.id,
                  REACTION_EMOJIS[index] as ReactionEmoji,
                  currentPage
                )
              }
            />
          </div>
        ))}

        {comments.length === 0 && (
          <p className="py-4 text-body-small text-text-muted">
            Nenhum comentário nesta página ainda.
          </p>
        )}
      </div>

      {/* Comment input — pinned to bottom */}
      <div className="shrink-0 border-t border-border-subtle px-5 pb-5 pt-4">
        {currentUserId ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              await createComment(currentPage, content)
              setContent('')
            }}
            className="flex flex-col gap-2"
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Comente nesta página…"
              rows={3}
              maxLength={1000}
              className="w-full resize-none rounded-sm border border-border-subtle bg-elevated p-3 text-body-small text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isCreating || !content.trim()}
            >
              {isCreating ? 'Enviando…' : 'Enviar'}
            </Button>
          </form>
        ) : (
          <p className="text-body-small text-text-muted">
            <a
              href="/auth/login"
              className="text-brand-accent underline underline-offset-4"
            >
              Entre
            </a>{' '}
            para deixar um comentário.
          </p>
        )}
      </div>
    </aside>
  )
}
