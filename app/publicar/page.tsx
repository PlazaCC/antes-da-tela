'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DragZone } from '@/components/ui/drag-zone'
import { cn } from '@/lib/utils'

const STEP_LABELS = ['Basic Info', 'Files', 'Category', 'Review'] as const

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

const MAX_PDF = 50 * 1024 * 1024 // 50MB

function validatePDF(file: File): string | null {
  if (file.type !== 'application/pdf') return 'Only PDF files are accepted'
  if (file.size > MAX_PDF) return 'File must be 50MB or smaller'
  return null
}

interface FormData {
  title: string
  logline: string
  synopsis: string
  genre: Genre | ''
  ageRating: AgeRating | ''
  pdfFile: File | null
  pdfStoragePath: string
  pdfError: string
}

const initialFormData: FormData = {
  title: '',
  logline: '',
  synopsis: '',
  genre: '',
  ageRating: '',
  pdfFile: null,
  pdfStoragePath: '',
  pdfError: '',
}

export default function PublicarPage() {
  const router = useRouter()
  const supabase = createClient()
  const trpc = useTRPC()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialFormData)
  const [userId, setUserId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)
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
        router.push(`/roteiros/${script.id}`)
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

  const uploadPDF = async (): Promise<string> => {
    if (!form.pdfFile) throw new Error('No PDF selected')
    const path = `${userId}/${Date.now()}_${form.pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    setUploading(true)
    const { error } = await supabase.storage.from('scripts').upload(path, form.pdfFile)
    setUploading(false)
    if (error) throw new Error(error.message)
    return path
  }

  const handlePublish = async () => {
    if (!userId) return
    try {
      const storagePath = form.pdfStoragePath || (await uploadPDF())
      setForm((prev) => ({ ...prev, pdfStoragePath: storagePath }))
      await createMutation.mutateAsync({
        title: form.title,
        logline: form.logline || undefined,
        synopsis: form.synopsis || undefined,
        genre: form.genre || undefined,
        ageRating: form.ageRating || undefined,
        storagePath,
        fileSize: form.pdfFile?.size,
        authorId: userId,
      })
    } catch {
      // error handled by mutation state
    }
  }

  const canProceedStep1 = form.title.trim().length > 0
  const canProceedStep2 = form.pdfFile !== null && !form.pdfError

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-2xl mx-auto px-5 py-12">
        {/* Progress indicator — pill tabs matching Figma Progress component */}
        <div className="flex items-center mb-8">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1
            return (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-sm px-4 py-2 transition-colors',
                    s < step
                      ? 'bg-brand-accent/10 text-brand-accent/60'
                      : s === step
                        ? 'bg-brand-accent text-text-primary'
                        : 'bg-surface border border-border-subtle text-text-secondary',
                  )}
                >
                  <span className="font-mono text-label-mono-caps text-xs font-medium tracking-wider">
                    {s}
                  </span>
                  <span className="hidden sm:inline font-mono text-label-mono-caps text-xs font-medium tracking-wider uppercase">
                    {label}
                  </span>
                </div>
                {s < 4 && <div className="w-4 h-px bg-border-subtle" />}
              </div>
            )
          })}
        </div>

        <div className="bg-surface border border-border-subtle rounded-sm p-8">
          {/* ── Step 1: Basic Info ─────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-heading-3 text-text-primary">Basic Information</h1>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs">
                  Title *
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Script title"
                  maxLength={200}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs">
                  Logline
                </label>
                <Input
                  value={form.logline}
                  onChange={(e) => setForm((prev) => ({ ...prev, logline: e.target.value }))}
                  placeholder="One-sentence description (max 300 chars)"
                  maxLength={300}
                />
                <span className="text-xs text-text-muted text-right">{form.logline.length}/300</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs">
                  Synopsis
                </label>
                <textarea
                  value={form.synopsis}
                  onChange={(e) => setForm((prev) => ({ ...prev, synopsis: e.target.value }))}
                  placeholder="Brief synopsis (max 2000 chars)"
                  maxLength={2000}
                  rows={5}
                  className="w-full rounded-md border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="text-xs text-text-muted text-right">{form.synopsis.length}/2000</span>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="bg-brand-accent text-primary hover:bg-brand-accent/90"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Files ──────────────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-heading-3 text-text-primary">Upload Files</h1>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs">
                  Script PDF *
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => pdfInputRef.current?.click()}
                >
                  <DragZone
                    title={
                      form.pdfFile
                        ? form.pdfFile.name
                        : 'Drag & drop PDF here'
                    }
                    subtitle={form.pdfFile ? `${(form.pdfFile.size / 1024 / 1024).toFixed(1)} MB` : 'or click to select — max 50 MB'}
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
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handlePDFSelect(file)
                  }}
                />
                {form.pdfError && (
                  <p className="text-xs text-state-error">{form.pdfError}</p>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="bg-brand-accent text-primary hover:bg-brand-accent/90"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Categorization ─────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-heading-3 text-text-primary">Categorization</h1>

              <div className="flex flex-col gap-3">
                <label className="font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs">
                  Genre
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, genre: prev.genre === g ? '' : g }))
                      }
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                        form.genre === g
                          ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                          : 'bg-surface border-border-subtle text-text-secondary hover:border-brand-accent/50',
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs">
                  Age Rating
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {AGE_RATINGS.map(({ value, label }) => (
                    <label
                      key={value}
                      className={cn(
                        'flex cursor-pointer items-center justify-between gap-4 rounded-sm border p-3 transition-colors',
                        form.ageRating === value
                          ? 'border-brand-accent bg-brand-accent/10'
                          : 'border-border-subtle bg-elevated hover:border-brand-accent/50',
                      )}
                    >
                      <span className="text-sm font-medium text-text-primary">{label}</span>
                      <input
                        type="radio"
                        name="ageRating"
                        value={value}
                        checked={form.ageRating === value}
                        onChange={() => setForm((prev) => ({ ...prev, ageRating: value }))}
                        className="h-4 w-4 appearance-none rounded-full border border-border-subtle bg-background checked:border-brand-accent checked:bg-brand-accent focus:outline-none"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="bg-brand-accent text-primary hover:bg-brand-accent/90"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Review ─────────────────────────────────────── */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-heading-3 text-text-primary">Review & Publish</h1>

              <div className="flex flex-col gap-4 rounded-sm border border-border-subtle bg-elevated p-6">
                <ReviewRow label="Title" value={form.title} />
                {form.logline && <ReviewRow label="Logline" value={form.logline} />}
                {form.synopsis && <ReviewRow label="Synopsis" value={form.synopsis} />}
                {form.pdfFile && <ReviewRow label="PDF" value={form.pdfFile.name} />}
                {form.genre && <ReviewRow label="Genre" value={form.genre} />}
                {form.ageRating && <ReviewRow label="Age Rating" value={form.ageRating} />}
              </div>

              {createMutation.error && (
                <p className="text-sm text-state-error">
                  Error publishing script. Please try again.
                </p>
              )}

              {uploading && (
                <p className="text-sm text-text-secondary">Uploading PDF...</p>
              )}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(3)} disabled={uploading || createMutation.isPending}>
                  Back
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={uploading || createMutation.isPending || !userId}
                  className="bg-brand-accent text-primary hover:bg-brand-accent/90 px-8"
                >
                  {createMutation.isPending || uploading ? 'Publishing…' : 'Publish Script'}
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
    <div className="flex flex-col gap-1">
      <span className="font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs">
        {label}
      </span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  )
}
