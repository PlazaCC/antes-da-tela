'use client'

import { DeleteScriptDialog } from '@/components/dashboard/delete-script-dialog'
import { EmptyScriptsState } from '@/components/dashboard/empty-scripts-state'
import { ScriptsTable } from '@/components/dashboard/scripts-table'
import { Button } from '@/components/ui/button'
import { useScriptManagement } from '@/lib/hooks/use-script-management'
import { FileUpIcon } from 'lucide-react'
import Link from 'next/link'

export default function MyScriptsPage() {
  const {
    scripts,
    isLoading,
    isDeleting,
    deleteScriptId,
    setDeleteScriptId,
    handleDelete,
  } = useScriptManagement()

  return (
    <div className='px-5 md:px-8 py-7'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='font-display text-[24px] leading-[1.37] text-text-primary'>Meus Roteiros</h1>
          <p className='text-body-small text-text-muted mt-1'>
            Gerencie suas obras publicadas e rascunhos.
          </p>
        </div>
        <Button asChild className='bg-brand-accent text-text-primary hover:bg-brand-accent/90'>
          <Link href='/publish'>
            <FileUpIcon className='w-4 h-4 mr-2' />
            Publicar Roteiro
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className='bg-surface border border-border-default rounded-sm p-12 flex flex-col items-center justify-center gap-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent'></div>
          <p className='font-mono text-label-mono-caps text-text-muted'>Carregando...</p>
        </div>
      ) : scripts.length === 0 ? (
        <EmptyScriptsState />
      ) : (
        <ScriptsTable scripts={scripts} onDeleteClick={setDeleteScriptId} />
      )}

      <DeleteScriptDialog
        isOpen={!!deleteScriptId}
        onOpenChange={(open) => !open && setDeleteScriptId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
