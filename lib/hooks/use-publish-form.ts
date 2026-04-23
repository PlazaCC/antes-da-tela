import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { usePublishUpload } from '@/lib/hooks/use-publish-upload'
import { publishFormSchema, type PublishFormValues } from '@/lib/validators/publish'
import { useTRPC } from '@/trpc/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm, type UseFormSetValue } from 'react-hook-form'
import { toast } from 'sonner'

const INITIAL_PUBLISH_FORM_VALUES: PublishFormValues = {
  title: '',
  logline: '',
  synopsis: '',
  genre: '',
  ageRating: '',
  pdfStoragePath: '',
  audioStoragePath: '',
  coverStoragePath: '',
  bannerStoragePath: '',
}

const MAX_PDF_BYTES = 5 * 1024 * 1024
const MAX_AUDIO_BYTES = 20 * 1024 * 1024
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

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

function validateImage(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Apenas imagens são aceitas'
  if (file.size > MAX_IMAGE_BYTES) return 'A imagem deve ter no máximo 2 MB'
  return null
}

interface UsePublishFormResult {
  step: number
  nextStep: () => void
  prevStep: () => void
  register: ReturnType<typeof useForm<PublishFormValues>>['register']
  watch: ReturnType<typeof useForm<PublishFormValues>>['watch']
  reset: ReturnType<typeof useForm<PublishFormValues>>['reset']
  setValue: UseFormSetValue<PublishFormValues>
  formState: ReturnType<typeof useForm<PublishFormValues>>['formState']
  values: PublishFormValues
  pdfFile: File | null
  audioFile: File | null
  coverFile: File | null
  bannerFile: File | null
  pdfError: string
  audioError: string
  coverError: string
  bannerError: string
  setPdfFile: (file: File | null) => void
  setAudioFile: (file: File | null) => void
  setCoverFile: (file: File | null) => void
  setBannerFile: (file: File | null) => void
  setPdfError: (value: string) => void
  setAudioError: (value: string) => void
  setCoverError: (value: string) => void
  setBannerError: (value: string) => void
  isEditing: boolean
  isLoadingScript: boolean
  pdfProgress: number
  audioProgress: number
  coverProgress: number
  bannerProgress: number
  uploading: boolean
  uploadError: string
  isPending: boolean
  handlePublish: () => Promise<void>
  canProceed: () => boolean
  validatePDF: (file: File) => string | null
  validateAudio: (file: File) => string | null
  validateImage: (file: File) => string | null
  hasUnsavedChanges: boolean
}

export function usePublishForm(scriptId?: string): UsePublishFormResult {
  const router = useRouter()
  const trpc = useTRPC()
  const { userId } = useCurrentUser()
  const { getAccessToken, getUserId, uploadFile } = usePublishUpload()
  const isEditing = Boolean(scriptId)

  const [baselineValues, setBaselineValues] = useState<PublishFormValues>(INITIAL_PUBLISH_FORM_VALUES)
  const [step, setStep] = useState(1)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [pdfError, setPdfError] = useState('')
  const [audioError, setAudioError] = useState('')
  const [coverError, setCoverError] = useState('')
  const [bannerError, setBannerError] = useState('')
  const [pdfProgress, setPdfProgress] = useState(0)
  const [audioProgress, setAudioProgress] = useState(0)
  const [coverProgress, setCoverProgress] = useState(0)
  const [bannerProgress, setBannerProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const form = useForm<PublishFormValues>({
    resolver: zodResolver(publishFormSchema),
    defaultValues: baselineValues,
    mode: 'onTouched',
  })

  const { register, watch, reset, setValue, formState } = form
  const values = watch()

  const { data: existingScript, isLoading: isLoadingScript } = useQuery(
    trpc.scripts.getById.queryOptions({ id: scriptId ?? '' }, { enabled: isEditing }),
  )

  useEffect(() => {
    const defaults = INITIAL_PUBLISH_FORM_VALUES
    reset(defaults)
    setBaselineValues(defaults)
    setStep(1)
    setPdfFile(null)
    setAudioFile(null)
    setCoverFile(null)
    setBannerFile(null)
    setPdfError('')
    setAudioError('')
    setCoverError('')
    setBannerError('')
    setPdfProgress(0)
    setAudioProgress(0)
    setCoverProgress(0)
    setBannerProgress(0)
    setUploading(false)
    setUploadError('')
  }, [reset, scriptId])

  useEffect(() => {
    if (!isEditing || !existingScript || userId !== existingScript.author?.id) return

    const loadedValues: PublishFormValues = {
      title: existingScript.title,
      logline: existingScript.logline || '',
      synopsis: existingScript.synopsis || '',
      genre: (existingScript.genre as PublishFormValues['genre']) || '',
      ageRating: (existingScript.age_rating as PublishFormValues['ageRating']) || '',
      pdfStoragePath: existingScript.script_files[0]?.storage_path || '',
      audioStoragePath: existingScript.audio_files[0]?.storage_path || '',
      coverStoragePath: (existingScript.cover_path as string) || '',
      bannerStoragePath: (existingScript.banner_path as string) || '',
    }

    reset(loadedValues)
    setBaselineValues(loadedValues)
    setPdfFile(null)
    setAudioFile(null)
    setCoverFile(null)
    setBannerFile(null)
    setPdfError('')
    setAudioError('')
    setCoverError('')
    setBannerError('')
  }, [existingScript, isEditing, reset, userId])

  const hasFormChanges = useMemo(
    () =>
      values.title.trim() !== baselineValues.title.trim() ||
      values.logline.trim() !== baselineValues.logline.trim() ||
      values.synopsis.trim() !== baselineValues.synopsis.trim() ||
      values.genre !== baselineValues.genre ||
      values.ageRating !== baselineValues.ageRating ||
      values.pdfStoragePath !== baselineValues.pdfStoragePath ||
      values.audioStoragePath !== baselineValues.audioStoragePath ||
      values.coverStoragePath !== baselineValues.coverStoragePath ||
      values.bannerStoragePath !== baselineValues.bannerStoragePath,
    [baselineValues, values],
  )

  const hasFileChanges = useMemo(
    () => Boolean(pdfFile) || Boolean(audioFile) || Boolean(coverFile) || Boolean(bannerFile),
    [bannerFile, coverFile, audioFile, pdfFile],
  )

  const hasUnsavedChanges = useMemo(
    () => step !== 1 || hasFormChanges || hasFileChanges || formState.isDirty,
    [formState.isDirty, hasFileChanges, hasFormChanges, step],
  )

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

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

    let pdfPath = values.pdfStoragePath
    let audioPath = values.audioStoragePath
    let coverPath = values.coverStoragePath
    let bannerPath = values.bannerStoragePath

    try {
      setUploading(true)
      const accessToken = await getAccessToken()
      const uid = await getUserId()

      const uploadAsset = async (
        file: File | null,
        currentPath: string,
        bucket: 'scripts' | 'audio' | 'avatars',
        onProgress: (pct: number) => void,
        fieldName: keyof PublishFormValues,
      ) => {
        if (!file) return currentPath

        const path = currentPath || `${uid}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const shouldUpsert = Boolean(currentPath)

        await uploadFile(bucket, path, file, accessToken, onProgress, shouldUpsert)
        setValue(fieldName, path)
        return path
      }

      pdfPath = await uploadAsset(pdfFile, pdfPath, 'scripts', setPdfProgress, 'pdfStoragePath')
      audioPath = await uploadAsset(audioFile, audioPath, 'audio', setAudioProgress, 'audioStoragePath')
      coverPath = await uploadAsset(coverFile, coverPath, 'avatars', setCoverProgress, 'coverStoragePath')
      bannerPath = await uploadAsset(bannerFile, bannerPath, 'avatars', setBannerProgress, 'bannerStoragePath')

      setUploading(false)

      if (isEditing) {
        updateMutation.mutate({
          id: scriptId as string,
          title: values.title,
          logline: values.logline || undefined,
          synopsis: values.synopsis || undefined,
          genre: values.genre || undefined,
          ageRating: values.ageRating || undefined,
          storagePath: pdfPath || undefined,
          fileSize: pdfFile?.size,
          coverPath: coverPath === '' ? null : coverPath,
          bannerPath: bannerPath === '' ? null : bannerPath,
          audioStoragePath: audioPath || undefined,
        })
      } else {
        createMutation.mutate({
          title: values.title,
          logline: values.logline || undefined,
          synopsis: values.synopsis || undefined,
          genre: values.genre || undefined,
          ageRating: values.ageRating || undefined,
          storagePath: pdfPath!,
          fileSize: pdfFile?.size,
          audioStoragePath: audioPath || undefined,
          coverPath: coverPath || undefined,
          bannerPath: bannerPath || undefined,
        })
      }
    } catch (error) {
      setUploading(false)
      setUploadError(error instanceof Error ? error.message : 'Falha no envio. Tente novamente.')
    }
  }

  const canProceed = () => {
    if (step === 1) return values.title.trim().length > 0
    if (step === 2) return (isEditing || pdfFile !== null || values.pdfStoragePath.length > 0) && !pdfError
    return true
  }

  const nextStep = () => setStep((value) => Math.min(value + 1, 4))
  const prevStep = () => setStep((value) => Math.max(value - 1, 1))

  return {
    step,
    nextStep,
    prevStep,
    register,
    watch,
    reset,
    setValue,
    formState,
    values,
    pdfFile,
    audioFile,
    coverFile,
    bannerFile,
    pdfError,
    audioError,
    coverError,
    bannerError,
    setPdfFile,
    setAudioFile,
    setCoverFile,
    setBannerFile,
    setPdfError,
    setAudioError,
    setCoverError,
    setBannerError,
    isEditing,
    isLoadingScript,
    pdfProgress,
    audioProgress,
    coverProgress,
    bannerProgress,
    uploading,
    uploadError,
    isPending: createMutation.isPending || updateMutation.isPending,
    handlePublish,
    canProceed,
    validatePDF,
    validateAudio,
    validateImage,
    hasUnsavedChanges,
  }
}
