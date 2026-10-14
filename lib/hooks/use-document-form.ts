'use client'

import { documentSchema, type DocumentFormValues } from '@/lib/validators/document'
import { useTRPC } from '@/trpc/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

const EMPTY: DocumentFormValues = { type: 'cpf', number: '', country: '' }

/**
 * The caller's identity document: the masked current value plus a form to
 * create or replace it. The full number is never sent back by the server.
 */
export function useDocumentForm() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const documentQuery = useQuery(trpc.users.getMyDocument.queryOptions())
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<DocumentFormValues>({ resolver: zodResolver(documentSchema), defaultValues: EMPTY })

  const mutation = useMutation(
    trpc.users.upsertDocument.mutationOptions({
      onSuccess: (saved) => {
        toast.success('Documento salvo.')
        posthog.capture('identity_document_saved', { type: saved.type })
        queryClient.setQueryData(trpc.users.getMyDocument.queryKey(), saved)
        form.reset(EMPTY)
        setIsEditing(false)
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  function startEditing() {
    form.reset(EMPTY)
    setIsEditing(true)
  }

  function cancelEditing() {
    form.reset(EMPTY)
    setIsEditing(false)
  }

  return {
    document: documentQuery.data ?? null,
    isLoading: documentQuery.isLoading,
    isEditing,
    isSaving: mutation.isPending,
    form,
    submit: form.handleSubmit((values) => mutation.mutate(values)),
    startEditing,
    cancelEditing,
  }
}
