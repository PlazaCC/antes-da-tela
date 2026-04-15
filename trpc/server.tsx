import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { makeQueryClient } from './query-client'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from './init'
import type React from 'react'

export const getQueryClient = cache(makeQueryClient)

export const trpc = createTRPCOptionsProxy({
  router: appRouter,
  ctx: async () => {
    const hdrs = await headers()
    return createTRPCContext({ headers: hdrs })
  },
  queryClient: getQueryClient,
})

export function HydrateClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  )
}
