'use client'

import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

export function useScriptManagement() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [deleteScriptId, setDeleteScriptId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading } = useQuery(trpc.scripts.getDashboardMetrics.queryOptions())

  const deleteMutation = useMutation(
    trpc.scripts.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Roteiro excluído com sucesso')
        void queryClient.invalidateQueries(trpc.scripts.getDashboardMetrics.queryFilter())
        setDeleteScriptId(null)
      },
      onError: (error) => {
        toast.error('Erro ao excluir roteiro: ' + error.message)
      },
      onSettled: () => {
        setIsDeleting(false)
      },
    }),
  )

  const handleDelete = async () => {
    if (!deleteScriptId) return
    setIsDeleting(true)
    deleteMutation.mutate({ id: deleteScriptId })
  }

  const scripts = data?.scripts ?? []
  const totalScripts = data?.totalScripts ?? 0
  const avgRating = data?.avgRating ?? null
  const totalComments = scripts.reduce((sum, s) => sum + s.commentCount, 0)

  return {
    scripts,
    totalScripts,
    avgRating,
    totalComments,
    isLoading,
    isDeleting,
    deleteScriptId,
    setDeleteScriptId,
    handleDelete,
  }
}
