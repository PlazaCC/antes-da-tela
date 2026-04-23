'use client'

import { ScriptCard } from '@/components/script-card/script-card'
import type { ScriptListItem } from '@/lib/types'
import { getStorageUrl } from '@/lib/utils'

interface ScriptsTabProps {
  scripts: ScriptListItem[]
  authorName: string
  ratingsMap?: Record<string, { average: number; total: number }>
}

export function ScriptsTab({ scripts, authorName, ratingsMap }: ScriptsTabProps) {
  if (scripts.length === 0) {
    return <p className='text-text-muted font-mono text-label-mono-caps py-12'>Nenhum roteiro publicado ainda.</p>
  }

  return (
    <>
      {/* Sort bar */}
      <div className='flex items-center justify-between mb-5'>
        <p className='font-mono text-[12px] text-text-muted'>{scripts.length} roteiros publicados</p>
        <button className='flex items-center gap-1 px-3 h-7 rounded-sm border border-border-default text-text-secondary font-sans text-[11px] hover:border-border-subtle transition-colors'>
          Mais recentes ▾
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {scripts.map((script) => (
          <ScriptCard
            key={script.id}
            href={`/scripts/${script.id}`}
            title={script.title}
            author={authorName}
            genre={script.genre ?? ''}
            rating={ratingsMap?.[script.id]?.average ?? null}
            ratingTotal={ratingsMap?.[script.id]?.total ?? 0}
            pages={script.script_files?.[0]?.page_count ?? null}
            coverUrl={getStorageUrl('avatars', script.cover_path)}
          />
        ))}
      </div>
    </>
  )
}
