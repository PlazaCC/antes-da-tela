'use client'

import { Progress } from '@/components/progress'
import { FileStep } from '@/components/publish/file-step'
import { GenreStep } from '@/components/publish/genre-step'
import { InfoStep } from '@/components/publish/info-step'
import { ReviewStep } from '@/components/publish/review-step'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { usePublishUpload } from '@/lib/hooks/use-publish-upload'
import { usePublishWizard } from '@/lib/hooks/use-publish-wizard'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const STEP_LABELS = ['Informações', 'Arquivos', 'Categorias', 'Revisão'] as const
const MAX_PDF_BYTES = 5 * 1024 * 1024
const MAX_AUDIO_BYTES = 20 * 1024 * 1024

function validatePDF(file: File): string | null {
  if (file.type !== 'application/pdf') return 'Apenas arquivos PDF são aceitos'
  if (file.size > MAX_PDF_BYTES) return 'O arquivo deve ter no máximo 5 MB'
  return null
}

function validateAudio(file: File): string | null {
  if (!file.type.startsWith('audio/')) return 'Apenas arquivos de áudio são aceitos'
  if (file.size > MAX_AUDIO_BYTES) return 'O arquivo deve ter no máximo 20 MB'
  return null
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024
function validateImage(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Apenas imagens são aceitas'
  if (file.size > MAX_IMAGE_BYTES) return 'A imagem deve ter no máximo 2 MB'
  return null
}

interface PublishPageProps {
  scriptId?: string
}

export function PublishPage({ scriptId }: PublishPageProps) {
  const router = useRouter()
  const trpc = useTRPC()
  const { userId } = useCurrentUser()
  const { getAccessToken, getUserId, uploadFile } = usePublishUpload()
  const { step, form, setForm, updateForm, nextStep, prevStep } = usePublishWizard()

  const isEditing = !!scriptId

  const { data: existingScript, isLoading: isLoadingScript } = useQuery(
    trpc.scripts.getById.queryOptions({ id: scriptId ?? '' }, { enabled: isEditing }),
  )

  const [pdfProgress, setPdfProgress] = useState(0)
  const [audioProgress, setAudioProgress] = useState(0)
  const [coverProgress, setCoverProgress] = useState(0)
  const [bannerProgress, setBannerProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (isEditing && existingScript && userId === existingScript.author?.id) {
      setForm({
        title: existingScript.title,
        logline: existingScript.logline || '',
        synopsis: existingScript.synopsis || '',
        genre: (existingScript.genre as (typeof form)['genre']) || '',
        ageRating: (existingScript.age_rating as (typeof form)['ageRating']) || '',
        pdfFile: null,
        pdfStoragePath: existingScript.script_files[0]?.storage_path || '',
        pdfError: '',
        audioFile: null,
        audioStoragePath: existingScript.audio_files[0]?.storage_path || '',
        audioError: '',
        coverFile: null,
        coverStoragePath: (existingScript.cover_path as string) || '',
        coverError: '',
        bannerFile: null,
        bannerStoragePath: (existingScript.banner_path as string) || '',
        bannerError: '',
      })
    }
  }, [existingScript, isEditing, setForm, userId])

  const createMutation = useMutation(
    trpc.scripts.create.mutationOptions({
      onSuccess: (script) => {
        toast.success('Roteiro publicado com sucesso!')
        router.push(`/scripts/${script.id}`)
      },
    }),
  )

  const updateMutation = useMutation(
    trpc.scripts.update.mutationOptions({
      onSuccess: (script) => {
        toast.success('Roteiro atualizado com sucesso!')
        router.push(`/scripts/${script.id}`)
      },
    }),
  )

  const handlePublish = async () => {
    if (!userId) return
    setUploadError('')

    let pdfPath = form.pdfStoragePath
    let audioPath = form.audioStoragePath
    let coverPath = form.coverStoragePath
    let bannerPath = form.bannerStoragePath

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

      if (!coverPath && form.coverFile) {
        coverPath = `${uid}/${Date.now()}_${form.coverFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        await uploadFile('avatars', coverPath, form.coverFile, accessToken, setCoverProgress)
        updateForm({ coverStoragePath: coverPath })
      }

      if (!bannerPath && form.bannerFile) {
        bannerPath = `${uid}/${Date.now()}_${form.bannerFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        await uploadFile('avatars', bannerPath, form.bannerFile, accessToken, setBannerProgress)
        updateForm({ bannerStoragePath: bannerPath })
      }

      setUploading(false)

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: scriptId as string,
          title: form.title,
          logline: form.logline || undefined,
          synopsis: form.synopsis || undefined,
          genre: form.genre || undefined,
          ageRating: form.ageRating || undefined,
          storagePath: pdfPath || undefined,
          fileSize: form.pdfFile?.size,
          coverPath: coverPath === '' ? null : coverPath,
          bannerPath: bannerPath === '' ? null : bannerPath,
        })
      } else {
        await createMutation.mutateAsync({
          title: form.title,
          logline: form.logline || undefined,
          synopsis: form.synopsis || undefined,
          genre: form.genre || undefined,
          ageRating: form.ageRating || undefined,
          storagePath: pdfPath!,
          fileSize: form.pdfFile?.size,
          audioStoragePath: audioPath || undefined,
          coverPath: coverPath || undefined,
          bannerPath: bannerPath || undefined,
        })
      }
    } catch (err) {
      setUploading(false)
      setUploadError(err instanceof Error ? err.message : 'Falha no envio. Tente novamente.')
    }
  }

  const canProceed = () => {
    if (step === 1) return form.title.trim().length > 0
    if (step === 2) return (isEditing || form.pdfFile !== null) && !form.pdfError
    return true
  }

  return (
    <div className='max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-12 pb-24 md:pb-12'>
      <div className='flex flex-col gap-6 md:gap-8'>
        <div className='flex flex-col gap-1 md:gap-2'>
          <h1 className='font-display text-heading-3 md:text-heading-2 text-text-primary'>
            {isEditing ? 'Editar Roteiro' : 'Publicar Roteiro'}
          </h1>
          <p className='text-body-small md:text-body-large text-text-secondary'>
            Complete as etapas abaixo para disponibilizar sua obra.
          </p>
        </div>

        <Progress current={step} steps={[...STEP_LABELS]} />

        {isEditing && isLoadingScript ? (
          <div className='bg-surface border border-border-default rounded-sm p-12 flex flex-col items-center justify-center gap-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent'></div>
            <p className='font-mono text-label-mono-caps text-text-muted'>Carregando roteiro...</p>
          </div>
        ) : (
          <div className='bg-surface border border-border-default rounded-sm p-5 md:p-8 flex flex-col gap-6 md:gap-8'>
            {step === 1 && <InfoStep form={form} updateForm={updateForm} />}
            {step === 2 && (
              <FileStep
                form={form}
                updateForm={updateForm}
                pdfProgress={pdfProgress}
                audioProgress={audioProgress}
                coverProgress={coverProgress}
                bannerProgress={bannerProgress}
                validatePDF={validatePDF}
                validateAudio={validateAudio}
                validateImage={validateImage}
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
                className='text-text-muted hover:text-text-primary'>
                Voltar
              </Button>

              {step < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className='bg-brand-accent text-text-primary hover:bg-brand-accent/90'>
                  Continuar
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={uploading || createMutation.isPending || updateMutation.isPending || !userId}
                  className='bg-brand-accent text-text-primary hover:bg-brand-accent/90 px-8'>
                  {createMutation.isPending || updateMutation.isPending || uploading
                    ? isEditing
                      ? 'Salvando...'
                      : 'Publicando...'
                    : isEditing
                      ? 'Salvar Alterações'
                      : 'Publicar Roteiro'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
