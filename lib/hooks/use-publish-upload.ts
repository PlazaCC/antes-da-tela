'use client'

/**
 * Provides upload utilities via S3 presigned URLs.
 * Uploads remain client-side to avoid Vercel's 10s API route timeout.
 * Auth is enforced server-side in /api/upload/presign.
 */
export function usePublishUpload() {
  async function getPresignedUrl(key: string, contentType: string): Promise<string> {
    const res = await fetch('/api/upload/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, contentType }),
    })

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Falha ao obter URL de upload.' }))
      throw new Error(error ?? 'Falha ao obter URL de upload.')
    }

    const { presignedUrl } = await res.json()
    return presignedUrl as string
  }

  /**
   * Uploads a file directly to S3 via a presigned PUT URL.
   * Returns the S3 key (stored in the database).
   */
  function uploadFile(
    key: string,
    file: File,
    onProgress: (pct: number) => void,
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let presignedUrl: string
      try {
        presignedUrl = await getPresignedUrl(key, file.type || 'application/octet-stream')
      } catch (err) {
        reject(err)
        return
      }

      const xhr = new XMLHttpRequest()
      xhr.open('PUT', presignedUrl)
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve()
        else {
          const statusMessages: Record<number, string> = {
            403: 'Sem permissão para fazer upload.',
            413: 'Arquivo excede o tamanho máximo permitido.',
          }
          const msg = statusMessages[xhr.status] ?? 'Falha no upload. Tente novamente.'
          reject(new Error(msg))
        }
      }
      xhr.onerror = () => reject(new Error('Erro de rede durante o upload'))
      xhr.send(file)
    })
  }

  return { uploadFile }
}
