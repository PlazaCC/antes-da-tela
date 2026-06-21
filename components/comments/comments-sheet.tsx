'use client'

import { CommentsSidebar } from '@/components/pdf-viewer/comments-sidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { MessageCircleMore } from 'lucide-react'
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
      <div className="fixed bottom-[68px] right-4 z-20 lg:hidden">
        <Button
          onClick={() => setCommentsOpen(true)}
          className="flex min-h-[44px] items-center gap-1.5 border border-border-subtle bg-surface px-4 font-mono text-label-mono-small text-text-secondary"
          variant="secondary"
        >
          <MessageCircleMore />
        </Button>
      </div>
      <Sheet open={commentsOpen} onOpenChange={setCommentsOpen}>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <CommentsSidebar
            scriptId={scriptId}
            currentUserId={currentUserId}
            onClose={() => setCommentsOpen(false)}
            hideClose
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
