'use client'

import type { Gender } from '@/lib/constants/preferences'
import type { UserProfile } from '@/lib/types'
import { profileSchema, toProfileInput, type ProfileFormValues } from '@/lib/validators/profile'
import { useTRPC } from '@/trpc/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface UseProfileFormResult {
  profile: UserProfile | null
  isLoadingProfile: boolean
  isPending: boolean
  form: ReturnType<typeof useForm<ProfileFormValues>>
  /** Private: saved to user_onboarding, never shown on the public profile. */
  gender: Gender | null
  setGender: (gender: Gender | null) => void
  submitProfile: (values: ProfileFormValues) => Promise<void>
}

function toFormValues(profile: UserProfile): ProfileFormValues {
  return {
    name: profile.name,
    bio: profile.bio ?? undefined,
    displayName: profile.displayName ?? undefined,
    pronouns: profile.pronouns ?? undefined,
    location: profile.location ?? undefined,
    instagram: profile.links?.instagram,
    website: profile.links?.website,
    portfolio: profile.links?.portfolio,
  }
}

/** Public profile fields (users) + private gender (user_onboarding), saved together. */
export function useProfileForm(userId: string, options: { onSaved?: () => void } = {}): UseProfileFormResult {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const profileQuery = useQuery({ ...trpc.users.getProfile.queryOptions({ id: userId }), enabled: !!userId })
  const stateQuery = useQuery(trpc.onboarding.getState.queryOptions())
  const [gender, setGender] = useState<Gender | null>(null)

  const updateProfile = useMutation(trpc.users.updateProfile.mutationOptions())
  const updateGender = useMutation(trpc.onboarding.setGender.mutationOptions())

  const form = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: '' } })
  const { reset } = form

  // keepDirtyValues: a refetch (e.g. after an avatar upload) must not wipe what the user is typing.
  useEffect(() => {
    if (profileQuery.data) reset(toFormValues(profileQuery.data), { keepDirtyValues: true })
  }, [profileQuery.data, reset])

  useEffect(() => {
    if (stateQuery.data) setGender(stateQuery.data.gender as Gender | null)
  }, [stateQuery.data])

  const submitProfile = async (values: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync(toProfileInput(values))
      if (gender !== (stateQuery.data?.gender ?? null)) {
        await updateGender.mutateAsync({ gender })
      }
      toast.success('Perfil atualizado.')
      posthog.capture('profile_updated')
      void queryClient.invalidateQueries(trpc.users.getProfile.queryFilter({ id: userId }))
      void queryClient.invalidateQueries(trpc.onboarding.getState.queryFilter())
      options.onSaved?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o perfil.')
    }
  }

  return {
    profile: profileQuery.data ?? null,
    isLoadingProfile: profileQuery.isLoading,
    isPending: updateProfile.isPending || updateGender.isPending,
    form,
    gender,
    setGender,
    submitProfile,
  }
}
