import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import * as React from 'react'

export interface CommentProps extends React.HTMLAttributes<HTMLDivElement> {
  author: string
  avatar?: string
  content: string
  time: string
  reply?: string
}

export const Comment = React.forwardRef<HTMLDivElement, CommentProps>(
  ({ className, author, avatar, content, time, reply, ...props }, ref) => (
    <article
      ref={ref}
      className={cn('rounded-3xl border border-border bg-background p-5 shadow-sm', className)}
      {...props}>
      <div className='flex items-start gap-3'>
        <Avatar>
          {avatar ? <AvatarImage src={avatar} alt={author} /> : <AvatarFallback>{author[0]}</AvatarFallback>}
        </Avatar>
        <div className='flex-1 space-y-2'>
          <div className='flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground'>
            <span className='font-medium text-foreground'>{author}</span>
            <span>{time}</span>
          </div>
          <p className='text-sm leading-6 text-secondary-foreground'>{content}</p>
          {reply ? (
            <div className='rounded-2xl border border-muted/80 bg-surface px-4 py-3 text-sm text-muted-foreground'>
              <span className='font-medium text-foreground'>Reply:</span> {reply}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  ),
)
Comment.displayName = 'Comment'
