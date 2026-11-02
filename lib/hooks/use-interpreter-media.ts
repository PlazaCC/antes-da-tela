'use client'

import { INTERPRETER_MEDIA, MAX_MEDIA_SECONDS, type InterpreterMediaKind } from '@/lib/constants/interpreters'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { usePublishUpload } from '@/lib/hooks/use-publish-upload'
import { readMediaDuration } from '@/lib/media/duration'
import { useState } from 'react'

export type UploadedMedia = { path: string; kind: InterpreterMediaKind; durationSeconds: number; previewUrl: string }

/**
 * Validates (type, size, ≤ 30s) and uploads an interpreter presentation to the
 * private `interpreters/{userId}/` S3 prefix, client-side.
 */
export function useInterpreterMedia() {
  const { userId } = useCurrentUser()
  const { uploadFile } = usePublishUpload()
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File, kind: InterpreterMediaKind): Promise<UploadedMedia | null> {
    setError(null)
    const rules = INTERPRETER_MEDIA[kind]
    if (!rules.contentTypes.includes(file.type)) return fail(`Formato não aceito. Envie ${rules.hint}.`)
    if (file.size > rules.maxBytes) return fail(`Arquivo muito grande. Envie ${rules.hint}.`)

    let duration: number
    try {
      duration = await readMediaDuration(file)
    } catch (err) {
      return fail(err instanceof Error ? err.message : 'Não foi possível ler o arquivo.')
    }
    if (!Number.isFinite(duration) || duration > MAX_MEDIA_SECONDS + 0.5) {
      return fail(`O ${kind === 'video' ? 'vídeo' : 'áudio'} deve ter no máximo ${MAX_MEDIA_SECONDS} segundos.`)
    }

    try {
      if (!userId) throw new Error('Usuário não autenticado.')
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80)
      const path = `interpreters/${userId}/${Date.now()}_${safeName}`
      setProgress(0)
      await uploadFile(path, file, setProgress)
      const durationSeconds = Math.min(MAX_MEDIA_SECONDS, Math.max(1, Math.round(duration)))
      return { path, kind, durationSeconds, previewUrl: URL.createObjectURL(file) }
    } catch (err) {
      return fail(err instanceof Error ? err.message : 'Falha no upload.')
    } finally {
      setProgress(null)
    }
  }

  function fail(message: string): null {
    setError(message)
    return null
  }

  return { upload, progress, error }
}
