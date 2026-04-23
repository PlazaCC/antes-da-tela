'use client'

import type { UserProfile } from '@/lib/types'
import { profileSchema, type ProfileFormValues } from '@/lib/validators/profile'
import { useTRPC } from '@/trpc/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface UseProfileFormResult {
  profile: UserProfile | null
  isLoadingProfile: boolean
  isPending: boolean
  register: ReturnType<typeof useForm<ProfileFormValues>>['register']
  handleSubmit: ReturnType<typeof useForm<ProfileFormValues>>['handleSubmit']
  formState: ReturnType<typeof useForm<ProfileFormValues>>['formState']
  submitProfile: (values: ProfileFormValues) => void
}

export function useProfileForm(userId: string): UseProfileFormResult {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    ...trpc.users.getProfile.queryOptions({ id: userId }),
    enabled: !!userId,
  })

  const updateProfileMutation = useMutation(
    trpc.users.updateProfile.mutationOptions({
      onSuccess: () => {
        toast.success('Perfil atualizado.')
        void queryClient.invalidateQueries(trpc.users.getProfile.queryFilter({ id: userId }))
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }),
  )

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', bio: undefined },
  })

  const { register, handleSubmit, reset, formState } = form

  useEffect(() => {
    if (!profileQuery.data) return
    reset({ name: profileQuery.data.name, bio: profileQuery.data.bio ?? undefined })
  }, [profileQuery.data, reset])

  const submitProfile = (values: ProfileFormValues) => {
    updateProfileMutation.mutate({ name: values.name, bio: values.bio || null })
  }

  return {
    profile: profileQuery.data ?? null,
    isLoadingProfile: profileQuery.isLoading,
    isPending: updateProfileMutation.isPending,
    register,
    handleSubmit,
    formState,
    submitProfile,
  }
}
