'use client'

import { Progress } from '@/components/progress'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DragZone } from '@/components/ui/drag-zone'
import { Input } from '@/components/ui/input'
import { useAutoFillPublishForm } from '@/lib/dev-mocks'
import { AGE_RATINGS, GENRES, formatAgeRating } from '@/lib/constants/scripts'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'

type Genre = (typeof GENRES)[number]
type AgeRating = (typeof AGE_RATINGS)[number]

const STEP_LABELS = ['Informações', 'Arquivos', 'Categorias', 'Revisão'] as const

const MAX_PDF_BYTES = 50 * 1024 * 1024
const MAX_AUDIO_BYTES = 100 * 1024 * 1024

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

async function uploadWithProgress(
  supabaseUrl: string,
  accessToken: string,
  bucket: string,
  storagePath: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`)
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload falhou: ${xhr.status}`))
    }
    xhr.onerror = () => reject(new Error('Erro de rede durante o upload'))
    xhr.send(file)
  })
}

export default function PublishPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const trpc = useTRPC()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<PublishFormState>(INITIAL_FORM_STATE)
  const [userId, setUserId] = useState<string | null>(null)
  const [pdfProgress, setPdfProgress] = useState(0)
  const [audioProgress, setAudioProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const isDraggingOver = useRef(false)
  const [dragActive, setDragActive] = useState(false)

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
    setForm((prev) => ({ ...prev, pdfFile: error ? null : file, pdfError: error ?? '', pdfStoragePath: '' }))
    setPdfProgress(0)
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

  const handlePublish = async () => {
    if (!userId) return
    setUploadError('')

    const session = await supabase.auth.getSession()
    const accessToken = session.data.session?.access_token
    if (!accessToken) {
      setUploadError('Sessão expirada. Faça login novamente.')
      return
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    let pdfPath = form.pdfStoragePath
    let audioPath = form.audioStoragePath

    try {
      setUploading(true)

      if (!pdfPath && form.pdfFile) {
        pdfPath = `${userId}/${Date.now()}_${form.pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        await uploadWithProgress(supabaseUrl, accessToken, 'scripts', pdfPath, form.pdfFile, setPdfProgress)
        setForm((prev) => ({ ...prev, pdfStoragePath: pdfPath }))
      }

      if (!audioPath && form.audioFile) {
        audioPath = `${userId}/${Date.now()}_${form.audioFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        await uploadWithProgress(supabaseUrl, accessToken, 'audio', audioPath, form.audioFile, setAudioProgress)
        setForm((prev) => ({ ...prev, audioStoragePath: audioPath }))
      }

      setUploading(false)

      await createMutation.mutateAsync({
        title: form.title,
        logline: form.logline || undefined,
        synopsis: form.synopsis || undefined,
        genre: form.genre || undefined,
        ageRating: form.ageRating || undefined,
        storagePath: pdfPath,
        fileSize: form.pdfFile?.size,
        audioStoragePath: audioPath || undefined,
      })
    } catch (err) {
      setUploading(false)
      setUploadError(err instanceof Error ? err.message : 'Falha no envio. Tente novamente.')
    }
  }

  // Auto-fill in development for faster form testing
  useAutoFillPublishForm(setForm as unknown as Dispatch<SetStateAction<Record<string, unknown>>>)

  const canProceedStep1 = form.title.trim().length > 0
  const canProceedStep2 = form.pdfFile !== null && !form.pdfError

  return (
    <div className='min-h-screen bg-bg-base'>
      <div className='max-w-2xl mx-auto px-5 py-12'>
        <Progress current={step} steps={[...STEP_LABELS]} className='mb-8' />

        <div className='bg-surface border border-border-subtle rounded-sm p-8'>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className='flex flex-col gap-6'>
              <h1 className='font-display text-heading-3 text-text-primary'>Informações Básicas</h1>

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

          {/* Step 2: Files */}
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

              <div className='flex flex-col gap-2'>
                <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
                  Áudio de Leitura <span className='normal-case text-text-muted'>(opcional)</span>
                </label>
                <div onClick={() => audioInputRef.current?.click()} className='cursor-pointer'>
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
                    setForm((prev) => ({ ...prev, audioFile: error ? null : file, audioError: error ?? '', audioStoragePath: '' }))
                    setAudioProgress(0)
                  }}
                />
                {form.audioError && <p className='text-xs text-state-error'>{form.audioError}</p>}
                {form.audioFile && (
                  <button
                    type='button'
                    onClick={() => {
                      setForm((prev) => ({ ...prev, audioFile: null, audioStoragePath: '', audioError: '' }))
                      setAudioProgress(0)
                    }}
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

          {/* Step 3: Categorization */}
          {step === 3 && (
            <div className='flex flex-col gap-6'>
              <h1 className='font-display text-heading-3 text-text-primary'>Categorias</h1>

              <div className='flex flex-col gap-3'>
                <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
                  Gênero
                </label>
                <div className='flex flex-col gap-2'>
                  {GENRES.map((g) => (
                    <label
                      key={g}
                      className={cn(
                        'flex items-center gap-3 rounded-sm border px-4 py-3 cursor-pointer transition-colors',
                        form.genre === g
                          ? 'border-brand-accent bg-brand-accent/10'
                          : 'border-border-subtle bg-elevated hover:border-brand-accent/50',
                      )}>
                      <Checkbox
                        checked={form.genre === g}
                        onCheckedChange={() =>
                          setForm((prev) => ({ ...prev, genre: prev.genre === g ? '' : g }))
                        }
                        className={cn(
                          'border-border-subtle',
                          form.genre === g && 'border-brand-accent data-[state=checked]:bg-brand-accent',
                        )}
                      />
                      <span className='text-sm text-text-primary capitalize'>{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className='flex flex-col gap-3'>
                <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
                  Faixa Etária
                </label>
                <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
                  {AGE_RATINGS.map((value) => (
                    <label
                      key={value}
                      className={cn(
                        'flex cursor-pointer items-center justify-between gap-4 rounded-sm border p-3 transition-colors',
                        form.ageRating === value
                          ? 'border-brand-accent bg-brand-accent/10'
                          : 'border-border-subtle bg-elevated hover:border-brand-accent/50',
                      )}>
                      <span className='text-sm font-medium text-text-primary'>
                        {formatAgeRating(value)}
                      </span>
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

          {/* Step 4: Review */}
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
                {form.ageRating && (
                  <ReviewRow
                    label='Faixa Etária'
                    value={formatAgeRating(form.ageRating)}
                  />
                )}
              </div>

              {uploading && (
                <div className='flex flex-col gap-3'>
                  {form.pdfFile && pdfProgress < 100 && (
                    <UploadProgressBar label='Enviando PDF' progress={pdfProgress} />
                  )}
                  {form.audioFile && audioProgress < 100 && (
                    <UploadProgressBar label='Enviando áudio' progress={audioProgress} />
                  )}
                </div>
              )}

              {(createMutation.error || uploadError) && (
                <p className='text-sm text-state-error'>
                  {uploadError || 'Erro ao publicar o roteiro. Tente novamente.'}
                </p>
              )}

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

function UploadProgressBar({ label, progress }: { label: string; progress: number }) {
  return (
    <div className='flex flex-col gap-1'>
      <div className='flex justify-between text-xs text-text-secondary font-mono'>
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className='h-1 w-full bg-border-subtle rounded-full overflow-hidden'>
        <div
          className='h-full bg-brand-accent transition-all duration-200'
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
