'use client'

import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { Tag } from '@/components/ui/tag'
import type { TagVariant } from '@/components/ui/tag'

const GENRE_VARIANT_MAP: Record<string, TagVariant> = {
  drama: 'drama',
  thriller: 'thriller',
  comédia: 'comédia',
}

export default function ScriptPageClient({ scriptId }: { scriptId: string }) {
  const trpc = useTRPC()
  const { data: script, isLoading, isError } = useQuery(
    trpc.scripts.getById.queryOptions({ id: scriptId }),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <p className="text-text-secondary font-mono text-label-mono-default">Carregando roteiro…</p>
      </div>
    )
  }

  if (isError || !script) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <p className="text-state-error font-mono text-label-mono-default">Roteiro não encontrado.</p>
      </div>
    )
  }

  const genreVariant: TagVariant = GENRE_VARIANT_MAP[script.genre ?? ''] ?? 'default'

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-10">
          <div className="flex items-center gap-2 flex-wrap">
            {script.genre && (
              <Tag variant={genreVariant}>{script.genre}</Tag>
            )}
            {script.ageRating && (
              <Tag variant="default">{script.ageRating}</Tag>
            )}
          </div>

          <h1 className="font-display text-heading-1 text-text-primary">{script.title}</h1>

          {script.logline && (
            <p className="text-body-large text-text-secondary">{script.logline}</p>
          )}

          {script.author && (
            <p className="font-mono text-label-mono-default text-text-muted">
              por <span className="text-text-secondary">{script.author.name}</span>
            </p>
          )}
        </div>

        {/* Synopsis */}
        {script.synopsis && (
          <div className="mb-10">
            <h2 className="font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs mb-3">
              Sinopse
            </h2>
            <p className="text-body-default text-text-primary leading-relaxed whitespace-pre-wrap">
              {script.synopsis}
            </p>
          </div>
        )}

        {/* File info */}
        {script.scriptFiles?.[0] && (
          <div className="rounded-sm border border-border-subtle bg-surface p-6">
            <h2 className="font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs mb-4">
              Arquivo do Roteiro
            </h2>
            <div className="flex flex-col gap-2">
              {script.scriptFiles[0].pageCount && (
                <p className="text-sm text-text-secondary">
                  <span className="text-text-muted">Páginas: </span>
                  {script.scriptFiles[0].pageCount}
                </p>
              )}
              {script.scriptFiles[0].fileSize && (
                <p className="text-sm text-text-secondary">
                  <span className="text-text-muted">Tamanho: </span>
                  {(script.scriptFiles[0].fileSize / 1024 / 1024).toFixed(1)} MB
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
