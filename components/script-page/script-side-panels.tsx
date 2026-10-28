'use client'

import { CommentsSidebar } from '@/components/pdf-viewer/comments-sidebar'
import { CharactersPanel } from '@/components/script-page/characters-panel'
import { Button } from '@/components/ui/button'
import type { ScriptCharacter } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MessageCircleMore, Users } from 'lucide-react'
import posthog from 'posthog-js'
import { useState, type ReactNode } from 'react'

type Panel = 'comments' | 'characters'

interface ScriptSidePanelsProps {
  scriptId: string
  currentUserId: string | null
  characters: ScriptCharacter[]
}

/**
 * Desktop side panels over the PDF (comments, characters). The bubble rail
 * stays visible beside the open panel so readers can switch between them.
 */
export function ScriptSidePanels({ scriptId, currentUserId, characters }: ScriptSidePanelsProps) {
  const [openPanel, setOpenPanel] = useState<Panel | null>('comments')
  const isOpen = openPanel !== null

  const toggle = (panel: Panel) => {
    if (panel === 'characters' && openPanel !== 'characters') {
      posthog.capture('script_characters_opened', { script_id: scriptId })
    }
    setOpenPanel((current) => (current === panel ? null : panel))
  }

  return (
    <>
      <div
        className={cn(
          'absolute top-4 z-50 hidden flex-col gap-2 transition-[right] duration-300 ease-in-out lg:flex',
          isOpen ? 'right-[344px] xl:right-[calc(25%+4px)]' : 'right-4',
        )}>
        <PanelBubble
          label='comentários'
          active={openPanel === 'comments'}
          onClick={() => toggle('comments')}
          icon={<MessageCircleMore />}
        />
        {characters.length > 0 && (
          <PanelBubble
            label='personagens'
            active={openPanel === 'characters'}
            onClick={() => toggle('characters')}
            icon={<Users />}
          />
        )}
      </div>

      <aside
        aria-hidden={!isOpen}
        className={cn(
          'absolute right-0 top-0 z-40 hidden h-full min-h-0 w-[340px] shrink-0 overflow-hidden p-3 transition-transform duration-300 ease-in-out lg:block xl:w-1/4',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}>
        <div className='h-full w-full overflow-hidden rounded-xl border border-border-subtle'>
          {openPanel === 'characters' ? (
            <CharactersPanel characters={characters} onClose={() => setOpenPanel(null)} />
          ) : (
            <CommentsSidebar scriptId={scriptId} currentUserId={currentUserId} onClose={() => setOpenPanel(null)} />
          )}
        </div>
      </aside>
    </>
  )
}

interface PanelBubbleProps {
  label: string
  active: boolean
  icon: ReactNode
  onClick: () => void
}

function PanelBubble({ label, active, icon, onClick }: PanelBubbleProps) {
  const actionLabel = `${active ? 'Fechar' : 'Abrir'} ${label}`

  return (
    <Button
      variant='secondary'
      size='icon-sm'
      className={cn('rounded-full shadow-md', active && 'bg-brand-accent text-text-primary hover:bg-brand-accent/90')}
      aria-pressed={active}
      aria-label={actionLabel}
      title={actionLabel}
      onClick={onClick}>
      {icon}
    </Button>
  )
}
