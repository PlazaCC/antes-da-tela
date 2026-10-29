import { CastList } from '@/components/calls/cast-list'
import { CallPhaseTag } from '@/components/calls/call-phase-tag'
import { EntryCard } from '@/components/calls/entry-card'
import { ShareButton } from '@/components/calls/share-button'
import { VotePanel } from '@/components/calls/vote-panel'
import { SectionHeading } from '@/components/shared/section-heading'
import { loadCall, loadResults } from '@/lib/calls/load'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string; entryId: string }> }

async function load(slug: string, entryId: string) {
  const data = await loadCall(slug)
  const entry = data?.entries.find((e) => e.id === entryId)
  return data && entry ? { call: data.call, entry } : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, entryId } = await params
  const data = await load(slug, entryId)
  if (!data) return { title: 'Roteiro não encontrado' }
  const title = `Vote em “${data.entry.script.title}” · ${data.call.title}`
  const description = data.entry.script.logline ?? `Roteiro de ${data.entry.script.authorName} no edital ${data.call.title}.`
  const images = data.entry.script.coverUrl ? [data.entry.script.coverUrl] : undefined
  return { title, description, openGraph: { title, description, images }, twitter: { card: 'summary_large_image', title, description, images } }
}

/** Shared link (D11): one entry of a call, its cast, and the vote (V1–V3). */
export default async function EntryPage({ params }: Props) {
  const { slug, entryId } = await params
  const data = await load(slug, entryId)
  if (!data) notFound()
  const { call, entry } = data
  const { cast, counts } = await loadResults(call.id)
  const path = `/editais/${slug}/r/${entryId}`
  const shareText = `Vote em “${entry.script.title}” no edital ${call.title} do Antes da Tela!`
  const isWinner = call.result.winnerEntryId === entry.id

  return (
    <main className='max-w-3xl mx-auto px-5 py-12 flex flex-col gap-8'>
      <div className='flex flex-col gap-2'>
        <Link href={`/editais/${slug}`} className='text-xs text-text-muted hover:text-text-secondary'>
          ← {call.title}
        </Link>
        <div className='flex flex-wrap gap-2'>
          <CallPhaseTag phase={call.phase} />
          {isWinner && <span className='text-xs font-semibold text-brand-accent'>🏆 Vencedor</span>}
        </div>
      </div>
      <EntryCard entry={entry} />
      {cast.some((m) => m.entryId === entry.id) && (
        <section className='flex flex-col gap-3'>
          <SectionHeading>Elenco</SectionHeading>
          <CastList cast={cast.filter((m) => m.entryId === entry.id)} />
        </section>
      )}
      {call.phase === 'voting' && <VotePanel callId={call.id} entryId={entry.id} path={path} shareText={shareText} />}
      {call.phase === 'finished' && counts && <p className='text-body-small text-text-secondary'>{counts[entry.id] ?? 0} votos</p>}
      {call.phase !== 'voting' && <ShareButton path={path} text={shareText} />}
    </main>
  )
}
