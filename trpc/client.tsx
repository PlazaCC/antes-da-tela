'use client'

import type { AppRouter } from '@/server/api/root'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { useState } from 'react'
import superjson from 'superjson'
import { makeQueryClient } from './query-client'

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>()

let clientQueryClient: ReturnType<typeof makeQueryClient> | undefined

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  if (!clientQueryClient) clientQueryClient = makeQueryClient()
  return clientQueryClient
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
        }),
      ],
    }),
  )

  // QueryClientProvider must be the outer wrapper; TRPCProvider reads the
  // QueryClient from context and must be nested inside it.  Reversing this
  // order causes React to detect conflicting QueryClient contexts and triggers
  // the "multiple renderers concurrently rendering the same context provider"
  // warning, which breaks hydration.
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
