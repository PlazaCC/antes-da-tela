import { CastList } from '@/components/calls/cast-list'
import { EntryCard } from '@/components/calls/entry-card'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import type { CallEntry, CallResult, CastMember } from '@/lib/types/calls'

const price = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface WinnerBlockProps {
  slug: string
  winner: CallEntry
  cast: CastMember[]
  result: CallResult
}

/** E10 — the winning script, its cast, the live and the recording (external links for now). */
export function WinnerBlock({ slug, winner, cast, result }: WinnerBlockProps) {
  const liveDate = result.liveAt
    ? new Date(result.liveAt).toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <section className='flex flex-col gap-4 rounded-sm border border-brand-accent/40 bg-surface p-5'>
      <SectionHeading>🏆 Roteiro vencedor</SectionHeading>
      <EntryCard entry={winner} href={`/editais/${slug}/r/${winner.id}`} className='border-0 p-0' />
      <CastList cast={cast.filter((m) => m.entryId === winner.id)} />
      {(liveDate || result.ticketUrl || result.liveUrl) && (
        <div className='flex flex-col gap-2'>
          <p className='font-medium text-text-primary'>Live de leitura dramática{liveDate && ` · ${liveDate}`}</p>
          {result.ticketPriceCents !== null && (
            <p className='text-body-small text-text-secondary'>
              Ingresso simbólico de {price(result.ticketPriceCents)}
              {result.castSharePercent !== null && ` — ${result.castSharePercent}% vai para o elenco`}.
            </p>
          )}
          <div className='flex flex-wrap gap-2'>
            {result.ticketUrl && (
              <Button asChild>
                <a href={result.ticketUrl} target='_blank' rel='noopener noreferrer'>
                  Garantir ingresso
                </a>
              </Button>
            )}
            {result.liveUrl && (
              <Button asChild variant='outline'>
                <a href={result.liveUrl} target='_blank' rel='noopener noreferrer'>
                  Assistir à live
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
      {result.recordingUrl && (
        <Button asChild variant='outline' className='self-start'>
          <a href={result.recordingUrl} target='_blank' rel='noopener noreferrer'>
            Assistir à gravação
          </a>
        </Button>
      )}
    </section>
  )
}
