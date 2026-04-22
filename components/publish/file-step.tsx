'use client'

import { DragZone } from '@/components/drag-zone/drag-zone'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { PublishFormState } from '@/lib/hooks/use-publish-wizard'
import { FileIcon, Music, Trash2 } from 'lucide-react'

interface FileStepProps {
  form: PublishFormState
  updateForm: (updates: Partial<PublishFormState>) => void
  pdfProgress: number
  audioProgress: number
  validatePDF: (file: File) => string | null
  validateAudio: (file: File) => string | null
}

export function FileStep({
  form,
  updateForm,
  pdfProgress,
  audioProgress,
  validatePDF,
  validateAudio,
}: FileStepProps) {
  return (
    <div className='flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300'>
      {/* PDF Upload */}
      <div className='flex flex-col gap-3'>
        <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
          Arquivo do Roteiro (PDF)
        </label>
        {!form.pdfFile ? (
          <DragZone
            accept={{ 'application/pdf': ['.pdf'] }}
            maxFiles={1}
            onFilesDrop={(files) => {
              const file = files[0]
              if (!file) return
              const error = validatePDF(file)
              if (error) updateForm({ pdfError: error })
              else updateForm({ pdfFile: file, pdfError: '' })
            }}
            className={cn(form.pdfError && 'border-state-error/50 bg-state-error/5')}
          />
        ) : (
          <div className='bg-elevated border border-border-subtle rounded-sm p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent'>
                <FileIcon size={20} />
              </div>
              <div className='flex flex-col'>
                <span className='text-body-small font-medium text-text-primary'>{form.pdfFile.name}</span>
                <span className='text-xs text-text-muted'>{(form.pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
            <button
              onClick={() => updateForm({ pdfFile: null, pdfStoragePath: '' })}
              className='p-2 hover:bg-surface-hover text-text-muted hover:text-state-error transition-colors rounded-sm'
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
        {form.pdfError && <p className='text-state-error text-xs font-mono'>{form.pdfError}</p>}
        {pdfProgress > 0 && pdfProgress < 100 && (
          <div className='flex flex-col gap-1.5'>
            <div className='flex justify-between text-[10px] font-mono text-text-muted uppercase'>
              <span>Enviando PDF...</span>
              <span>{pdfProgress}%</span>
            </div>
            <Progress value={pdfProgress} className='h-1' />
          </div>
        )}
      </div>

      {/* Audio Upload */}
      <div className='flex flex-col gap-3'>
        <div className='flex justify-between items-end'>
          <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
            Pilotagem / Audio Drama (Opcional)
          </label>
          <span className='text-[10px] font-mono text-text-muted uppercase tracking-widest'>MP3, WAV, M4A</span>
        </div>
        {!form.audioFile ? (
          <DragZone
            accept={{ 'audio/*': ['.mp3', '.wav', '.m4a'] }}
            maxFiles={1}
            onFilesDrop={(files) => {
              const file = files[0]
              if (!file) return
              const error = validateAudio(file)
              if (error) updateForm({ audioError: error })
              else updateForm({ audioFile: file, audioError: '' })
            }}
            className={cn(form.audioError && 'border-state-error/50 bg-state-error/5')}
          />
        ) : (
          <div className='bg-elevated border border-border-subtle rounded-sm p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent'>
                <Music size={20} />
              </div>
              <div className='flex flex-col'>
                <span className='text-body-small font-medium text-text-primary'>{form.audioFile.name}</span>
                <span className='text-xs text-text-muted'>{(form.audioFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
            <button
              onClick={() => updateForm({ audioFile: null, audioStoragePath: '' })}
              className='p-2 hover:bg-surface-hover text-text-muted hover:text-state-error transition-colors rounded-sm'
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
        {form.audioError && <p className='text-state-error text-xs font-mono'>{form.audioError}</p>}
        {audioProgress > 0 && audioProgress < 100 && (
          <div className='flex flex-col gap-1.5'>
            <div className='flex justify-between text-[10px] font-mono text-text-muted uppercase'>
              <span>Enviando Áudio...</span>
              <span>{audioProgress}%</span>
            </div>
            <Progress value={audioProgress} className='h-1' />
          </div>
        )}
      </div>
    </div>
  )
}
