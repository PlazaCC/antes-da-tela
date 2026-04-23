'use client'

import { formatAgeRating } from '@/lib/constants/scripts'
import type { PublishFormValues } from '@/lib/validators/publish'
import { FileIcon, Info, Music, Tag } from 'lucide-react'

interface ReviewStepProps {
  values: PublishFormValues
  pdfFile: File | null
  audioFile: File | null
}

export function ReviewStep({ values, pdfFile, audioFile }: ReviewStepProps) {
  return (
    <div className='flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300'>
      <div className='bg-elevated border border-border-subtle rounded-sm p-6 flex flex-col gap-8'>
        {/* Info Summary */}
        <div className='flex gap-4'>
          <div className='w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
            <Info size={20} />
          </div>
          <div className='flex flex-col gap-1 min-w-0'>
            <span className='text-xs font-mono text-text-muted uppercase tracking-wider'>Informações</span>
            <h3 className='text-heading-3 text-text-primary truncate'>{values.title || 'Sem título'}</h3>
            {values.logline && <p className='text-body-small text-text-secondary line-clamp-2'>{values.logline}</p>}
          </div>
        </div>

        {/* Files Summary */}
        <div className='flex gap-4'>
          <div className='w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
            <FileIcon size={20} />
          </div>
          <div className='flex flex-col gap-1'>
            <span className='text-xs font-mono text-text-muted uppercase tracking-wider'>Arquivos</span>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2 text-body-small text-text-secondary'>
                <span className='font-medium text-text-primary'>PDF:</span>
                <span>{pdfFile?.name || values.pdfStoragePath?.split('/').pop() || 'Não selecionado'}</span>
              </div>
              {audioFile && (
                <div className='flex items-center gap-2 text-body-small text-text-secondary'>
                  <Music size={14} className='text-brand-accent' />
                  <span className='font-medium text-text-primary'>Áudio:</span>
                  <span>{audioFile.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories Summary */}
        <div className='flex gap-4'>
          <div className='w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
            <Tag size={20} />
          </div>
          <div className='flex flex-col gap-1'>
            <span className='text-xs font-mono text-text-muted uppercase tracking-wider'>Categorias</span>
            <div className='flex gap-3 flex-wrap'>
              <div className='flex items-center gap-1.5 text-body-small'>
                <span className='text-text-muted'>Gênero:</span>
                <span className='text-text-primary font-medium'>{values.genre || 'Não definido'}</span>
              </div>
              <div className='flex items-center gap-1.5 text-body-small'>
                <span className='text-text-muted'>Classificação:</span>
                <span className='text-text-primary font-medium'>
                  {values.ageRating ? formatAgeRating(values.ageRating) : 'Não definido'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='p-4 bg-brand-accent/5 border border-brand-accent/20 rounded-sm flex gap-3 items-start'>
        <Info size={18} className='text-brand-accent shrink-0 mt-0.5' />
        <p className='text-xs text-brand-accent/80 leading-relaxed'>
          Ao publicar, seu roteiro ficará disponível para todos os usuários da plataforma. Você poderá editá-lo ou
          removê-lo a qualquer momento através do seu painel.
        </p>
      </div>
    </div>
  )
}
