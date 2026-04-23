import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface EmptyScriptsStateProps {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyScriptsState({
  title = 'Nenhum roteiro encontrado',
  description = 'Você ainda não publicou nenhum roteiro. Comece agora mesmo!',
  actionLabel = 'Publicar meu primeiro roteiro',
  actionHref = '/publish',
}: EmptyScriptsStateProps) {
  return (
    <div className='bg-surface border border-border-default rounded-sm p-16 flex flex-col items-center justify-center text-center gap-4 shadow-sm'>
      <div className='w-16 h-16 rounded-full bg-elevated flex items-center justify-center mb-2'>
        <Trash2 className='w-8 h-8 text-text-muted opacity-20' />
      </div>
      <p className='text-text-primary font-medium'>{title}</p>
      <p className='text-body-small text-text-muted max-w-[300px]'>
        {description}
      </p>
      <Button asChild className='mt-4' variant='outline'>
        <Link href={actionHref}>
          <Plus className='w-4 h-4 mr-2' />
          {actionLabel}
        </Link>
      </Button>
    </div>
  )
}
