'use client'

import { Progress } from '@/components/progress'
import { Button } from '@/components/ui/button'
import { FileStep } from '@/components/publish/file-step'
import { GenreStep } from '@/components/publish/genre-step'
import { InfoStep } from '@/components/publish/info-step'
import { ReviewStep } from '@/components/publish/review-step'
import { useAutoFillPublishForm } from '@/lib/dev-mocks'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { usePublishUpload } from '@/lib/hooks/use-publish-upload'
import { usePublishWizard } from '@/lib/hooks/use-publish-wizard'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState, type Dispatch, type SetStateAction } from 'react'

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

export default function PublishPage() {
  const router = useRouter()
  const trpc = useTRPC()
  const { userId } = useCurrentUser()
  const { getAccessToken, getUserId, uploadFile } = usePublishUpload()
  const { step, form, setForm, updateForm, nextStep, prevStep } = usePublishWizard()

  const [pdfProgress, setPdfProgress] = useState(0)
  const [audioProgress, setAudioProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const createMutation = useMutation(
    trpc.scripts.create.mutationOptions({
      onSuccess: (script) => {
        router.push(`/scripts/${script.id}`)
      },
    }),
  )

  const handlePublish = async () => {
    if (!userId) return
    setUploadError('')

    let pdfPath = form.pdfStoragePath
    let audioPath = form.audioStoragePath

    try {
      setUploading(true)
      const accessToken = await getAccessToken()
      const uid = await getUserId()

      if (!pdfPath && form.pdfFile) {
        pdfPath = `${uid}/${Date.now()}_${form.pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        await uploadFile('scripts', pdfPath, form.pdfFile, accessToken, setPdfProgress)
        updateForm({ pdfStoragePath: pdfPath })
      }

      if (!audioPath && form.audioFile) {
        audioPath = `${uid}/${Date.now()}_${form.audioFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        await uploadFile('audio', audioPath, form.audioFile, accessToken, setAudioProgress)
        updateForm({ audioStoragePath: audioPath })
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

  useAutoFillPublishForm(setForm as unknown as Dispatch<SetStateAction<Record<string, unknown>>>)

  const canProceed = () => {
    if (step === 1) return form.title.trim().length > 0
    if (step === 2) return form.pdfFile !== null && !form.pdfError
    return true
  }

  return (
    <div className='min-h-screen bg-bg-base'>
      <div className='max-w-3xl mx-auto px-5 py-12'>
        <div className='flex flex-col gap-8'>
          <div className='flex flex-col gap-2'>
            <h1 className='font-display text-heading-2 text-text-primary'>Publicar Roteiro</h1>
            <p className='text-body-large text-text-secondary'>Complete as etapas abaixo para disponibilizar sua obra.</p>
          </div>

          <Progress current={step} steps={[...STEP_LABELS]} />

          <div className='bg-surface border border-border-default rounded-sm p-8 flex flex-col gap-8'>
            {step === 1 && <InfoStep form={form} updateForm={updateForm} />}
            {step === 2 && (
              <FileStep
                form={form}
                updateForm={updateForm}
                pdfProgress={pdfProgress}
                audioProgress={audioProgress}
                validatePDF={validatePDF}
                validateAudio={validateAudio}
              />
            )}
            {step === 3 && <GenreStep form={form} updateForm={updateForm} />}
            {step === 4 && <ReviewStep form={form} />}

            {uploadError && <p className='text-state-error text-xs font-mono'>{uploadError}</p>}

            <div className='flex items-center justify-between pt-4 border-t border-border-subtle'>
              <Button
                variant='ghost'
                onClick={prevStep}
                disabled={step === 1 || uploading || createMutation.isPending}
                className='text-text-muted hover:text-text-primary'
              >
                Voltar
              </Button>

              {step < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className='bg-brand-accent text-text-primary hover:bg-brand-accent/90'
                >
                  Continuar
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={uploading || createMutation.isPending || !userId}
                  className='bg-brand-accent text-text-primary hover:bg-brand-accent/90 px-8'
                >
                  {createMutation.isPending || uploading ? 'Publicando...' : 'Publicar Roteiro'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
