'use client'

import { CharactersPanel } from '@/components/script-page/characters-panel'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import type { ScriptCharacter } from '@/lib/types'
import { Users } from 'lucide-react'
import { useState } from 'react'

interface CharactersSheetProps {
  characters: ScriptCharacter[]
}

/** Mobile: FAB (stacked above the comments FAB) + bottom sheet. */
export function CharactersSheet({ characters }: CharactersSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className='fixed bottom-[124px] right-4 z-20 lg:hidden'>
        <Button
          onClick={() => setOpen(true)}
          aria-label='Abrir personagens'
          className='flex min-h-[44px] items-center gap-1.5 border border-border-subtle bg-surface px-4 font-mono text-label-mono-small text-text-secondary'
          variant='secondary'>
          <Users />
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side='bottom' className='h-[80vh] p-0'>
          <SheetTitle className='sr-only'>Personagens</SheetTitle>
          <CharactersPanel characters={characters} hideClose />
        </SheetContent>
      </Sheet>
    </>
  )
}
