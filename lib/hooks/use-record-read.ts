'use client'

import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'

const DEBOUNCE_MS = 2000

/**
 * Saves the furthest page the signed-in reader reached (script_reads). Writes
 * once scrolling settles for 2 s and flushes on unmount, so a whole read costs a
 * handful of requests. Pass enabled=false for signed-out readers and the author.
 */
export function useRecordRead(scriptId: string, enabled: boolean) {
  const trpc = useTRPC()
  const { mutate } = useMutation(trpc.scripts.recordRead.mutationOptions())
  const sent = useRef(0)
  const pending = useRef<{ page: number; pagesTotal: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    if (!pending.current) return
    sent.current = pending.current.page
    mutate({ scriptId, ...pending.current })
    pending.current = null
  }, [mutate, scriptId])

  useEffect(() => {
    sent.current = 0
    return flush
  }, [flush])

  return useCallback(
    (page: number, pagesTotal: number) => {
      if (!enabled || page <= sent.current || page <= (pending.current?.page ?? 0)) return
      pending.current = { page, pagesTotal }
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(flush, DEBOUNCE_MS)
    },
    [enabled, flush],
  )
}
