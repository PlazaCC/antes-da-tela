'use client'

import { requiredMediaKind, type InterpreterModality, type InterpreterMediaKind } from '@/lib/constants/interpreters'
import type { UploadedMedia } from '@/lib/hooks/use-interpreter-media'
import { interpreterSubmissionSchema } from '@/lib/validators/interpreter'
import type { InterpreterProfile } from '@/lib/types/interpreters'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { useState } from 'react'
import { toast } from 'sonner'

export type InterpreterFields = {
  birthDate: string
  experience: string
  ageRange: string
  languages: string
  drt: string
}

type Media = { path: string; kind: InterpreterMediaKind; durationSeconds: number; previewUrl: string | null }

/** Interpreter registration form state (onboarding O4 and /profile/interpreter). */
export function useInterpreterForm(current: InterpreterProfile | null, options: { onSubmitted?: () => void } = {}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [modalities, setModalities] = useState<InterpreterModality[]>(current?.modalities ?? [])
  const [media, setMedia] = useState<Media | null>(
    current
      ? { path: current.mediaPath, kind: current.mediaType, durationSeconds: current.durationSeconds, previewUrl: current.mediaUrl }
      : null,
  )
  const [fields, setFields] = useState<InterpreterFields>({
    birthDate: current?.birthDate ?? '',
    experience: current?.experience ?? '',
    ageRange: current?.ageRange ?? '',
    languages: current?.languages ?? '',
    drt: current?.drt ?? '',
  })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mutation = useMutation(
    trpc.interpreters.submit.mutationOptions({
      onSuccess: (saved) => {
        posthog.capture('interpreter_submitted', { modalities: saved.modalities, resubmission: !!current })
        toast.success('Cadastro enviado para curadoria.')
        void queryClient.invalidateQueries(trpc.interpreters.getMine.queryFilter())
        options.onSubmitted?.()
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  const mediaKind = modalities.length ? requiredMediaKind(modalities) : null

  const toggleModality = (modality: InterpreterModality) =>
    setModalities((list) => (list.includes(modality) ? list.filter((m) => m !== modality) : [...list, modality]))

  const setField = (key: keyof InterpreterFields, value: string) => setFields((f) => ({ ...f, [key]: value }))

  const onMediaUploaded = (uploaded: UploadedMedia) => setMedia(uploaded)

  const submit = () => {
    const parsed = interpreterSubmissionSchema.safeParse({
      modalities,
      mediaPath: media?.path ?? '',
      mediaType: media?.kind ?? mediaKind ?? 'video',
      durationSeconds: media?.durationSeconds ?? 0,
      ...fields,
      consent,
    })
    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message
      if (next.mediaPath || next.durationSeconds) next.mediaType ??= 'Envie sua apresentação'
      setErrors(next)
      return
    }
    setErrors({})
    mutation.mutate(parsed.data)
  }

  return {
    modalities,
    toggleModality,
    mediaKind,
    media,
    onMediaUploaded,
    fields,
    setField,
    consent,
    setConsent,
    errors,
    submit,
    isPending: mutation.isPending,
  }
}
