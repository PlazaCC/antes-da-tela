'use client'

import { CommentsSidebar } from '@/components/pdf-viewer/comments-sidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState } from 'react'

interface CommentsSheetProps {
  scriptId: string
  currentUserId: string | null
}

export function CommentsSheet({ scriptId, currentUserId }: CommentsSheetProps) {
  const [commentsOpen, setCommentsOpen] = useState(false)

  return (
    <>
      {/* Mobile: FAB + Sheet */}
      <div className='lg:hidden fixed bottom-[68px] right-4 z-20'>
        <Button
          onClick={() => setCommentsOpen(true)}
          className='flex items-center gap-1.5 px-4 min-h-[44px] bg-surface border border-border-subtle font-mono text-label-mono-small text-text-secondary'
          variant='outline'>
          💬 Comentários
        </Button>
      </div>
      <Sheet open={commentsOpen} onOpenChange={setCommentsOpen}>
        <SheetContent side='bottom' className='h-[80vh] p-0'>
          <SheetHeader className='sr-only'>
            <SheetTitle>Comentários</SheetTitle>
          </SheetHeader>
          <CommentsSidebar scriptId={scriptId} currentUserId={currentUserId} />
        </SheetContent>
      </Sheet>
    </>
  )
}
