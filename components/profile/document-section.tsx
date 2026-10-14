'use client'

import { DocumentFields } from '@/components/profile/document-fields'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocumentForm } from '@/lib/hooks/use-document-form'
import { DOCUMENT_LABELS, documentNeedsCountry } from '@/lib/utils/documents'
import { cn } from '@/lib/utils'

function countryName(code: string) {
  return new Intl.DisplayNames(['pt-BR'], { type: 'region' }).of(code) ?? code
}

/** Identity document required to publish. Private: shown masked, only to the owner. */
export function DocumentSection({ className }: { className?: string }) {
  const state = useDocumentForm()

  return (
    <section
      className={cn(
        'flex flex-col gap-5 rounded-sm border border-border-default bg-surface p-5 shadow-sm md:p-8',
        className,
      )}>
      <div>
        <SectionHeading>Documento de identificação</SectionHeading>
        <div className='mb-3 h-px w-full bg-border-default' />
        <p className='text-body-small text-text-secondary'>
          Necessário para publicar roteiros. Só você vê esse dado, e ele aparece mascarado.
        </p>
      </div>

      <DocumentBody state={state} />
    </section>
  )
}

function DocumentBody({ state }: { state: ReturnType<typeof useDocumentForm> }) {
  const { document, isLoading, isEditing, isSaving, form, submit, startEditing, cancelEditing } = state

  if (isLoading) return <Skeleton className='h-11 w-full max-w-[440px] bg-elevated' />

  if (isEditing || !document) {
    return (
      <form onSubmit={submit} className='flex max-w-[440px] flex-col gap-5'>
        <DocumentFields form={form} />
        <div className='flex flex-col gap-3 md:flex-row'>
          <Button type='submit' disabled={isSaving} className='h-11 w-full md:w-[160px]'>
            {isSaving ? 'Salvando…' : 'Salvar documento'}
          </Button>
          {document && (
            <Button type='button' variant='outline' onClick={cancelEditing} className='h-11 w-full md:w-auto'>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    )
  }

  return (
    <div className='flex max-w-[440px] flex-col gap-4 md:flex-row md:items-center md:justify-between'>
      <div className='flex flex-col gap-1'>
        <span className='font-mono text-sm uppercase tracking-wider text-text-secondary'>
          {DOCUMENT_LABELS[document.type]}
          {documentNeedsCountry(document.type) && ` · ${countryName(document.country)}`}
        </span>
        <span className='font-mono text-base text-text-primary'>{document.masked}</span>
      </div>
      <Button type='button' variant='outline' onClick={startEditing} className='h-11 w-full md:w-auto'>
        Alterar documento
      </Button>
    </div>
  )
}
