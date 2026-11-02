import { z } from 'zod'

export const castVoteSchema = z.object({ callId: z.uuid(), entryId: z.uuid() })

const optionalUrl = z.url('Link inválido').max(500).nullable()

/** A5 — winner and live/recording info (external links, no payment integration yet). */
export const callResultSchema = z.object({
  callId: z.uuid(),
  winnerEntryId: z.uuid().nullable(),
  liveAt: z.date().nullable(),
  liveUrl: optionalUrl,
  ticketUrl: optionalUrl,
  ticketPriceCents: z.number().int().min(0).max(1_000_000).nullable(),
  castSharePercent: z.number().int().min(0).max(100).nullable(),
  recordingUrl: optionalUrl,
})
export type CallResultInput = z.infer<typeof callResultSchema>
