'use client'

import { notifyError } from '@/lib/feedback'
import { AUDIO_CATEGORIES } from '@/lib/constants/scripts'
import type { AudioEntry } from '@/lib/hooks/use-audio-entries'
import { MAX_AUDIOS } from '@/lib/validators/scripts'
import { cn } from '@/lib/utils'
import { Music, Plus, Trash2 } from 'lucide-react'
import { FileUploadField } from './file-upload-field'

interface AudioFieldsProps {
  entries: AudioEntry[]
  addEntry: () => void
  removeEntry: (id: string) => void
  updateEntry: (id: string, patch: Partial<AudioEntry>) => void
  validateAudio: (file: File) => string | null
}

const audioAccept = { 'audio/mpeg': ['.mp3'], 'audio/wav': ['.wav'], 'audio/x-wav': ['.wav'] }

export function AudioFields({ entries, addEntry, removeEntry, updateEntry, validateAudio }: AudioFieldsProps) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-end'>
        <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
          Áudios do projeto
        </label>
        <span className='text-[10px] font-mono text-text-muted uppercase tracking-widest'>
          {entries.length}/{MAX_AUDIOS} · Opcional
        </span>
      </div>

      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className='flex flex-col gap-4 rounded-sm border border-border-subtle bg-elevated/40 p-4'>
          <div className='flex items-center justify-between'>
            <span className='font-mono text-[11px] text-text-muted uppercase tracking-wider'>Áudio {index + 1}</span>
            <button
              type='button'
              onClick={() => removeEntry(entry.id)}
              className='p-1.5 rounded-sm text-text-muted hover:text-state-error hover:bg-surface-hover transition-colors'
              aria-label='Remover áudio'>
              <Trash2 size={16} />
            </button>
          </div>

          <FileUploadField
            label='Arquivo de áudio'
            accept={audioAccept}
            file={entry.file}
            error={entry.error}
            progress={entry.progress}
            onFileReject={() => {
              const msg = 'Apenas MP3 ou WAV são aceitos'
              updateEntry(entry.id, { error: msg })
              notifyError(msg)
            }}
            onFileDrop={(file) => {
              const error = validateAudio(file)
              if (error) {
                updateEntry(entry.id, { error })
                notifyError(error)
              } else {
                updateEntry(entry.id, { file, error: '' })
              }
            }}
            onRemove={() => updateEntry(entry.id, { file: null, storagePath: '' })}
            infoText='Limite: 20MB. MP3 ou WAV.'
            showExisting={!entry.file && !!entry.storagePath}
            existingFileName={entry.storagePath.split('/').pop()}
            preview={
              <div className='w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
                <Music size={20} />
              </div>
            }
          />

          <div className='flex flex-col gap-2'>
            <span className='font-mono text-[10px] text-text-muted uppercase tracking-wider'>Categoria</span>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
              {AUDIO_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type='button'
                  onClick={() => updateEntry(entry.id, { title: category })}
                  className={cn(
                    'h-9 px-3 rounded-sm border text-xs font-medium transition-all',
                    entry.title === category
                      ? 'border-brand-accent bg-brand-accent/5 text-brand-accent ring-1 ring-brand-accent'
                      : 'border-border-subtle bg-elevated text-text-muted hover:border-text-muted hover:text-text-secondary',
                  )}>
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <span className='font-mono text-[10px] text-text-muted uppercase tracking-wider'>Descrição</span>
            <textarea
              value={entry.description}
              onChange={(e) => updateEntry(entry.id, { description: e.target.value.slice(0, 300) })}
              placeholder='Ex: Podcast com o roteirista comentando a obra...'
              rows={2}
              className='w-full rounded-sm border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-accent resize-none transition-colors'
            />
          </div>
        </div>
      ))}

      {entries.length < MAX_AUDIOS && (
        <button
          type='button'
          onClick={addEntry}
          className='flex items-center justify-center gap-2 h-11 rounded-sm border border-dashed border-border-default text-text-secondary hover:border-brand-accent hover:text-brand-accent transition-colors text-sm font-medium'>
          <Plus size={16} />
          Adicionar áudio
        </button>
      )}
    </div>
  )
}
