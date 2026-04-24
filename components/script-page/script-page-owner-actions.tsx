import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'

interface ScriptPageOwnerActionsProps {
  scriptId: string
  onDelete: () => void
  disabled?: boolean
}

export function ScriptPageOwnerActions({ scriptId, onDelete, disabled }: ScriptPageOwnerActionsProps) {
  return (
    <div className='flex items-center gap-2 shrink-0'>
      <Link href={`/publish?id=${scriptId}`}>
        <Button variant='outline' size='sm' className='flex items-center gap-1.5'>
          Editar
        </Button>
      </Link>
      <Button
        type='button'
        variant='ghost'
        className='text-state-error border border-state-error/20 hover:bg-state-error/10'
        disabled={disabled}
        onClick={onDelete}>
        <Trash2 className='h-3.5 w-3.5' />
        Excluir
      </Button>
    </div>
  )
}
