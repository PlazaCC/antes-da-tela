'use client'

import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { usePublishUpload } from '@/lib/hooks/use-publish-upload'
import { getAssetUrl } from '@/lib/storage/url'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

/**
 * Encapsulates avatar upload to S3 (presigned PUT) + profile image update via tRPC.
 *
 * Uploads remain client-side to avoid Vercel's 10s timeout on API routes.
 * Key: `avatars/{userId}/{timestamp}_avatar.{ext}`.
 */
export function useAvatarUpload() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { userId } = useCurrentUser()
  const { uploadFile } = usePublishUpload()
  const [isUploading, setIsUploading] = useState(false)

  const updateProfile = useMutation(trpc.users.updateProfile.mutationOptions())

  async function upload(file: File): Promise<void> {
    setIsUploading(true)
    try {
      if (!userId) throw new Error('Usuário não autenticado.')

      const ext = file.name.split('.').pop() ?? 'png'
      const key = `avatars/${userId}/${Date.now()}_avatar.${ext}`
      await uploadFile(key, file, () => {})

      const publicUrl = getAssetUrl(key)
      if (!publicUrl) throw new Error('Não foi possível gerar URL do avatar.')

      await updateProfile.mutateAsync({ image: publicUrl })
      void queryClient.invalidateQueries({
        queryKey: trpc.users.getProfile.queryOptions({ id: userId }).queryKey,
      })
      toast.success('Avatar atualizado.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload falhou.')
    } finally {
      setIsUploading(false)
    }
  }

  return { upload, isUploading }
}
