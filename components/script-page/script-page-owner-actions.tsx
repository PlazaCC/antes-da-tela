import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface ScriptPageOwnerActionsProps {
  scriptId: string
  onDelete: () => void
  disabled?: boolean
}

export function ScriptPageOwnerActions({
  scriptId,
  onDelete,
  disabled,
}: ScriptPageOwnerActionsProps) {
  return (
    <>
      <Link href={`/publish?id=${scriptId}`}>
        <Button
          variant="outline"
          size="xs"
          className="flex items-center gap-1.5"
        >
          <Pencil /> Editar
        </Button>
      </Link>
      <Button
        type="button"
        variant="destructive"
        size="xs"
        className="text-state-error"
        disabled={disabled}
        onClick={onDelete}
      >
        <Trash2 />
        Excluir
      </Button>
    </>
  )
}
