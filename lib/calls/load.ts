import 'server-only'

import { getQueryClient, trpc } from '@/trpc/server'
import { cache } from 'react'

/** Call page data, shared by generateMetadata and the page in one render. */
export const loadCall = cache((slug: string) => getQueryClient().fetchQuery(trpc.calls.getBySlug.queryOptions({ slug })))

export const loadResults = cache((callId: string) => getQueryClient().fetchQuery(trpc.votes.results.queryOptions({ callId })))
