'use client'

import { createClient } from '@/lib/supabase/client'
import { useMemo } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

/**
 * Provides upload utilities using XHR for progress reporting.
 * Uploads remain client-side to avoid Vercel's 10s API route timeout.
 */
export function usePublishUpload() {
  const supabase = useMemo(() => createClient(), [])

  async function getAccessToken(): Promise<string> {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) throw new Error('Sessão expirada. Faça login novamente.')
    return token
  }

  async function getUserId(): Promise<string> {
    const { data } = await supabase.auth.getUser()
    const id = data.user?.id
    if (!id) throw new Error('Usuário não autenticado.')
    return id
  }

  /**
   * Uploads a file to Supabase Storage via XHR so upload progress is trackable.
   * Returns the storage path used (bucket-relative).
   */
  function uploadFile(
    bucket: string,
    storagePath: string,
    file: File,
    accessToken: string,
    onProgress: (pct: number) => void,
    upsert = false,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${bucket}/${storagePath}`)
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
      xhr.setRequestHeader('x-upsert', upsert ? 'true' : 'false')
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

  return { getAccessToken, getUserId, uploadFile }
}
