'use client'

import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

/**
 * Encapsulates avatar upload to Supabase Storage + profile image update via tRPC.
 * Extracted from account/page.tsx and profile/edit/page.tsx (was duplicated).
 *
 * Uploads remain client-side to avoid Vercel's 10s timeout on API routes.
 */
export function useAvatarUpload() {
  const supabase = useMemo(() => createClient(), [])
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = useState(false)

  const updateProfile = useMutation(trpc.users.updateProfile.mutationOptions())

  async function upload(file: File): Promise<void> {
    setIsUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado.')

      const ext = file.name.split('.').pop() ?? 'png'
      const path = `${user.id}/${Date.now()}_avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      if (!urlData?.publicUrl) throw new Error('Não foi possível gerar URL do avatar.')

      await new Promise<void>((resolve, reject) => {
        updateProfile.mutate(
          { image: urlData.publicUrl },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                queryKey: trpc.users.getProfile.queryOptions({ id: user.id }).queryKey,
              })
              toast.success('Avatar atualizado.')
              resolve()
            },
            onError: (err) => {
              toast.error(err.message)
              reject(err)
            },
          },
        )
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload falhou.')
    } finally {
      setIsUploading(false)
    }
  }

  return { upload, isUploading }
}
