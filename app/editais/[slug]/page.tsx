import { CallActions } from '@/components/calls/call-actions'
import { CallPhaseTag } from '@/components/calls/call-phase-tag'
import { CallTimeline } from '@/components/calls/call-timeline'
import { EntryCard } from '@/components/calls/entry-card'
import { SectionHeading } from '@/components/shared/section-heading'
import { WinnerBlock } from '@/components/calls/winner-block'
import { loadCall, loadResults } from '@/lib/calls/load'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await loadCall((await params).slug)
  if (!data) return { title: 'Edital não encontrado' }
  return { title: data.call.title, description: data.call.description?.slice(0, 160) ?? undefined }
}

/** E2 — call page: schedule, rules, entered scripts and the action for the current phase. */
export default async function CallPage({ params }: Props) {
  const data = await loadCall((await params).slug)
  if (!data) notFound()
  const { call, entries } = data
  const showResults = call.phase === 'voting' || call.phase === 'finished'
  const { cast, counts } = showResults ? await loadResults(call.id) : { cast: [], counts: null }
  const winner = call.phase === 'finished' ? entries.find((e) => e.id === call.result.winnerEntryId) : undefined

  return (
    <main className='max-w-5xl mx-auto px-5 py-12 grid gap-10 md:grid-cols-[1fr_280px]'>
      <div className='flex flex-col gap-8 min-w-0'>
        <header className='flex flex-col gap-3'>
          <CallPhaseTag phase={call.phase} className='self-start' />
          <h1 className='font-display text-heading-2 text-text-primary'>{call.title}</h1>
          {call.partner && <p className='text-body-small text-text-secondary'>{call.partner}</p>}
          {call.description && <p className='text-body text-text-secondary whitespace-pre-line'>{call.description}</p>}
        </header>

        {winner && <WinnerBlock slug={call.slug} winner={winner} cast={cast} result={call.result} />}

        <section id='roteiros' className='flex flex-col gap-4'>
          <SectionHeading>Roteiros inscritos ({entries.length})</SectionHeading>
          {entries.length === 0 ? (
            <p className='text-body-small text-text-muted'>Os roteiros aprovados aparecem aqui.</p>
          ) : (
            entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                href={showResults ? `/editais/${call.slug}/r/${entry.id}` : undefined}
                footer={
                  call.phase === 'voting' ? (
                    <Link href={`/editais/${call.slug}/r/${entry.id}`} className='text-sm font-semibold text-brand-accent'>
                      Ver elenco e votar →
                    </Link>
                  ) : (
                    counts && <p className='text-xs text-text-muted'>{counts[entry.id] ?? 0} votos</p>
                  )
                }
              />
            ))
          )}
        </section>

        {call.rules && (
          <details className='rounded-sm border border-border-default bg-surface p-5'>
            <summary className='cursor-pointer font-medium text-text-primary'>Regulamento</summary>
            <p className='mt-4 text-body-small text-text-secondary whitespace-pre-line'>{call.rules}</p>
          </details>
        )}
      </div>

      <aside className='flex flex-col gap-6'>
        <SectionHeading>Cronograma</SectionHeading>
        <CallTimeline call={call} />
        <CallActions call={call} />
      </aside>
    </main>
  )
}
