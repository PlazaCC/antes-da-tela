import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ScriptActionsDropdownProps {
  scriptId: string
  onDeleteClick: (id: string) => void
}

export function ScriptActionsDropdown({ scriptId, onDeleteClick }: ScriptActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0 hover:bg-elevated'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='bg-surface border-border-default min-w-[140px] p-1'>
        <DropdownMenuItem asChild className='focus:bg-elevated cursor-pointer'>
          <Link href={`/publish?id=${scriptId}`} className='flex items-center'>
            <Pencil className='mr-2 h-4 w-4' />
            <span>Editar</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className='text-state-error focus:text-state-error focus:bg-state-error/10 cursor-pointer'
          onClick={() => onDeleteClick(scriptId)}>
          <Trash2 className='mr-2 h-4 w-4' />
          <span>Excluir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
