'use client'

import { Button } from '@/components/ui/button'
import { DragZone } from '@/components/ui/drag-zone'
import { Input } from '@/components/ui/input'
import { useAutoFillPublishForm } from '@/lib/dev-mocks'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'

const STEP_LABELS = ['Informações', 'Arquivo', 'Categorias', 'Revisão'] as const

const GENRES = [
  'drama',
  'thriller',
  'comédia',
  'ficção científica',
  'terror',
  'romance',
  'documentário',
  'animação',
  'outro',
] as const

const AGE_RATINGS = [
  { value: 'livre', label: 'Livre' },
  { value: '10', label: '10 anos' },
  { value: '12', label: '12 anos' },
  { value: '14', label: '14 anos' },
  { value: '16', label: '16 anos' },
  { value: '18', label: '18 anos' },
] as const

type Genre = (typeof GENRES)[number]
type AgeRating = (typeof AGE_RATINGS)[number]['value']

const MAX_PDF_BYTES = 50 * 1024 * 1024 // 50 MB
const MAX_AUDIO_BYTES = 100 * 1024 * 1024 // 100 MB

function validatePDF(file: File): string | null {
  if (file.type !== 'application/pdf') return 'Apenas arquivos PDF são aceitos'
  if (file.size > MAX_PDF_BYTES) return 'O arquivo deve ter no máximo 50 MB'
  return null
}

function validateAudio(file: File): string | null {
  if (!file.type.startsWith('audio/')) return 'Apenas arquivos de áudio são aceitos'
  if (file.size > MAX_AUDIO_BYTES) return 'O arquivo deve ter no máximo 100 MB'
  return null
}

interface PublishFormState {
  title: string
  logline: string
  synopsis: string
  genre: Genre | ''
  ageRating: AgeRating | ''
  pdfFile: File | null
  pdfStoragePath: string
  pdfError: string
  audioFile: File | null
  audioStoragePath: string
  audioError: string
}

const INITIAL_FORM_STATE: PublishFormState = {
  title: '',
  logline: '',
  synopsis: '',
  genre: '',
  ageRating: '',
  pdfFile: null,
  pdfStoragePath: '',
  pdfError: '',
  audioFile: null,
  audioStoragePath: '',
  audioError: '',
}

export default function PublishPage() {
  const router = useRouter()
  // Stable browser Supabase client — layout has already verified the session.
  const supabase = useMemo(() => createClient(), [])
  const trpc = useTRPC()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<PublishFormState>(INITIAL_FORM_STATE)
  const [userId, setUserId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const isDraggingOver = useRef(false)
  const [dragActive, setDragActive] = useState(false)

  // Read the user ID client-side so we can build the storage path.
  // The layout already guards the route server-side, so this is always defined.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [supabase])

  const createMutation = useMutation(
    trpc.scripts.create.mutationOptions({
      onSuccess: (script) => {
        router.push(`/scripts/${script.id}`)
      },
    }),
  )

  const handlePDFSelect = useCallback((file: File) => {
    const error = validatePDF(file)
    setForm((prev) => ({ ...prev, pdfFile: error ? null : file, pdfError: error ?? '' }))
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files[0]
      if (file) handlePDFSelect(file)
    },
    [handlePDFSelect],
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isDraggingOver.current) {
      isDraggingOver.current = true
      setDragActive(true)
    }
  }

  const handleDragLeave = () => {
    isDraggingOver.current = false
    setDragActive(false)
  }

  // All uploads are client-side — Vercel server functions time out at 10s.
  const uploadPDF = async (): Promise<string> => {
    if (!form.pdfFile) throw new Error('No PDF selected')
    const storagePath = `${userId}/${Date.now()}_${form.pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    setUploading(true)
    const { error } = await supabase.storage.from('scripts').upload(storagePath, form.pdfFile)
    setUploading(false)
    if (error) throw new Error(error.message)
    return storagePath
  }

  const uploadAudio = async (): Promise<string> => {
    if (!form.audioFile) throw new Error('No audio file selected')
    const storagePath = `${userId}/${Date.now()}_${form.audioFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    setUploading(true)
    const { error } = await supabase.storage.from('audio').upload(storagePath, form.audioFile)
    setUploading(false)
    if (error) throw new Error(error.message)
    return storagePath
  }

  const handlePublish = async () => {
    if (!userId) return
    setUploadError('')
    // Preserve storagePaths so a retry after a mutation failure skips re-upload.
    let storagePath = form.pdfStoragePath
    let audioStoragePath = form.audioStoragePath
    try {
      if (!storagePath) {
        storagePath = await uploadPDF()
        setForm((prev) => ({ ...prev, pdfStoragePath: storagePath }))
      }
      if (form.audioFile && !audioStoragePath) {
        audioStoragePath = await uploadAudio()
        setForm((prev) => ({ ...prev, audioStoragePath }))
      }
      await createMutation.mutateAsync({
        title: form.title,
        logline: form.logline || undefined,
        synopsis: form.synopsis || undefined,
        genre: form.genre || undefined,
        ageRating: form.ageRating || undefined,
        storagePath,
        fileSize: form.pdfFile?.size,
        audioStoragePath: audioStoragePath || undefined,
      })
    } catch (err) {
      if (!storagePath) {
        // Upload failed — mutation errors are surfaced via createMutation.error
        setUploadError(err instanceof Error ? err.message : 'Falha no envio. Tente novamente.')
      }
    }
  }

  // Auto-fill in development for faster form testing.
  useAutoFillPublishForm(setForm as unknown as Dispatch<SetStateAction<Record<string, unknown>>>)

  const canProceedStep1 = form.title.trim().length > 0
  const canProceedStep2 = form.pdfFile !== null && !form.pdfError

  return (
    <div className='min-h-screen bg-bg-base'>
      <div className='max-w-2xl mx-auto px-5 py-12'>
        {/* Progress indicator — pill tabs matching Figma Progress component */}
        <div className='flex items-center mb-8'>
          {STEP_LABELS.map((label, i) => {
            const s = i + 1
            return (
              <div key={s} className='flex items-center'>
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-sm px-4 py-2 transition-colors',
                    s < step
                      ? 'bg-brand-accent/10 text-brand-accent/60'
                      : s === step
                        ? 'bg-brand-accent text-text-primary'
                        : 'bg-surface border border-border-subtle text-text-secondary',
                  )}>
                  <span className='font-mono text-label-mono-caps text-xs font-medium tracking-wider'>{s}</span>
                  <span className='hidden sm:inline font-mono text-label-mono-caps text-xs font-medium tracking-wider uppercase'>
                    {label}
                  </span>
                </div>
                {s < 4 && <div className='w-4 h-px bg-border-subtle' />}
              </div>
            )
          })}
        </div>

        <div className='bg-surface border border-border-subtle rounded-sm p-8'>
          {/* ── Step 1: Basic Info ─────────────────────────────────── */}
          {step === 1 && (
            <div className='flex flex-col gap-6'>
              <h1 className='font-display text-heading-3 text-text-primary'>Informações Básicas</h1>

              {/* dev auto-fill handled by useAutoFillPublishForm */}

              <div className='flex flex-col gap-2'>
                <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
                  Título *
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder='Título do roteiro'
                  maxLength={200}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
                  Logline
                </label>
                <Input
                  value={form.logline}
                  onChange={(e) => setForm((prev) => ({ ...prev, logline: e.target.value }))}
                  placeholder='Descrição em uma frase (máx. 300 caracteres)'
                  maxLength={300}
                />
                <span className='text-xs text-text-muted text-right'>{form.logline.length}/300</span>
              </div>

              <div className='flex flex-col gap-2'>
                <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
                  Sinopse
                </label>
                <textarea
                  value={form.synopsis}
                  onChange={(e) => setForm((prev) => ({ ...prev, synopsis: e.target.value }))}
                  placeholder='Sinopse breve (máx. 2000 caracteres)'
                  maxLength={2000}
                  rows={5}
                  className='w-full rounded-md border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                />
                <span className='text-xs text-text-muted text-right'>{form.synopsis.length}/2000</span>
              </div>

              <div className='flex justify-end'>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className='bg-brand-accent text-primary hover:bg-brand-accent/90'>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Files ──────────────────────────────────────── */}
          {step === 2 && (
            <div className='flex flex-col gap-6'>
              <h1 className='font-display text-heading-3 text-text-primary'>Upload do Roteiro</h1>

              <div className='flex flex-col gap-2'>
                <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
                  PDF do Roteiro *
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => pdfInputRef.current?.click()}>
                  <DragZone
                    title={form.pdfFile ? form.pdfFile.name : 'Arraste o PDF aqui'}
                    subtitle={
                      form.pdfFile
                        ? `${(form.pdfFile.size / 1024 / 1024).toFixed(1)} MB`
                        : 'ou clique para selecionar — máx. 50 MB'
                    }
                    className={cn(
                      'cursor-pointer',
                      dragActive && 'border-brand-accent bg-brand-accent/5',
                      form.pdfFile && !form.pdfError && 'border-state-success/60 bg-state-success/5',
                      form.pdfError && 'border-state-error/60 bg-state-error/5',
                    )}
                  />
                </div>
                <input
                  ref={pdfInputRef}
                  type='file'
                  accept='application/pdf'
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handlePDFSelect(file)
                  }}
                />
                {form.pdfError && <p className='text-xs text-state-error'>{form.pdfError}</p>}
              </div>

              {/* Optional audio upload */}
              <div className='flex flex-col gap-2'>
                <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
                  Áudio de Leitura <span className='normal-case text-text-muted'>(opcional)</span>
                </label>
                <div
                  onClick={() => audioInputRef.current?.click()}
                  className='cursor-pointer'>
                  <DragZone
                    title={form.audioFile ? form.audioFile.name : 'Arraste o áudio aqui'}
                    subtitle={
                      form.audioFile
                        ? `${(form.audioFile.size / 1024 / 1024).toFixed(1)} MB`
                        : 'ou clique para selecionar — MP3, WAV, AAC — máx. 100 MB'
                    }
                    className={cn(
                      'cursor-pointer',
                      form.audioFile && !form.audioError && 'border-state-success/60 bg-state-success/5',
                      form.audioError && 'border-state-error/60 bg-state-error/5',
                    )}
                  />
                </div>
                <input
                  ref={audioInputRef}
                  type='file'
                  accept='audio/*'
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const error = validateAudio(file)
                    setForm((prev) => ({ ...prev, audioFile: error ? null : file, audioError: error ?? '' }))
                  }}
                />
                {form.audioError && <p className='text-xs text-state-error'>{form.audioError}</p>}
                {form.audioFile && (
                  <button
                    type='button'
                    onClick={() => setForm((prev) => ({ ...prev, audioFile: null, audioStoragePath: '', audioError: '' }))}
                    className='text-xs text-text-muted hover:text-state-error text-left'>
                    Remover áudio
                  </button>
                )}
              </div>

              <div className='flex justify-between'>
                <Button variant='ghost' onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className='bg-brand-accent text-primary hover:bg-brand-accent/90'>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Categorization ─────────────────────────────── */}
          {step === 3 && (
            <div className='flex flex-col gap-6'>
              <h1 className='font-display text-heading-3 text-text-primary'>Categorias</h1>

              <div className='flex flex-col gap-3'>
                <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
                  Gênero
                </label>
                <div className='flex flex-wrap gap-2'>
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type='button'
                      onClick={() => setForm((prev) => ({ ...prev, genre: prev.genre === g ? '' : g }))}
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                        form.genre === g
                          ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                          : 'bg-surface border-border-subtle text-text-secondary hover:border-brand-accent/50',
                      )}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className='flex flex-col gap-3'>
                <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
                  Faixa Etária
                </label>
                <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
                  {AGE_RATINGS.map(({ value, label }) => (
                    <label
                      key={value}
                      className={cn(
                        'flex cursor-pointer items-center justify-between gap-4 rounded-sm border p-3 transition-colors',
                        form.ageRating === value
                          ? 'border-brand-accent bg-brand-accent/10'
                          : 'border-border-subtle bg-elevated hover:border-brand-accent/50',
                      )}>
                      <span className='text-sm font-medium text-text-primary'>{label}</span>
                      <input
                        type='radio'
                        name='ageRating'
                        value={value}
                        checked={form.ageRating === value}
                        onChange={() => setForm((prev) => ({ ...prev, ageRating: value }))}
                        className='h-4 w-4 appearance-none rounded-full border border-border-subtle bg-background checked:border-brand-accent checked:bg-brand-accent focus:outline-none'
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className='flex justify-between'>
                <Button variant='ghost' onClick={() => setStep(2)}>
                  Voltar
                </Button>
                <Button onClick={() => setStep(4)} className='bg-brand-accent text-primary hover:bg-brand-accent/90'>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Review ─────────────────────────────────────── */}
          {step === 4 && (
            <div className='flex flex-col gap-6'>
              <h1 className='font-display text-heading-3 text-text-primary'>Revisão e Publicação</h1>

              <div className='flex flex-col gap-4 rounded-sm border border-border-subtle bg-elevated p-6'>
                <ReviewRow label='Título' value={form.title} />
                {form.logline && <ReviewRow label='Logline' value={form.logline} />}
                {form.synopsis && <ReviewRow label='Sinopse' value={form.synopsis} />}
                {form.pdfFile && <ReviewRow label='PDF' value={form.pdfFile.name} />}
                {form.audioFile && <ReviewRow label='Áudio' value={form.audioFile.name} />}
                {form.genre && <ReviewRow label='Gênero' value={form.genre} />}
                {form.ageRating && <ReviewRow label='Faixa Etária' value={form.ageRating} />}
              </div>

              {(createMutation.error || uploadError) && (
                <p className='text-sm text-state-error'>
                  {uploadError || 'Erro ao publicar o roteiro. Tente novamente.'}
                </p>
              )}

              {uploading && <p className='text-sm text-text-secondary'>Enviando PDF...</p>}

              <div className='flex justify-between'>
                <Button variant='ghost' onClick={() => setStep(3)} disabled={uploading || createMutation.isPending}>
                  Voltar
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={uploading || createMutation.isPending || !userId}
                  className='bg-brand-accent text-primary hover:bg-brand-accent/90 px-8'>
                  {createMutation.isPending || uploading ? 'Publicando…' : 'Publicar Roteiro'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
        {label}
      </span>
      <span className='text-sm text-text-primary'>{value}</span>
    </div>
  )
}
