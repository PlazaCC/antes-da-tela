import { CastingBoard } from '@/components/casting/casting-board'
import { PageShell } from '@/components/shared/page-shell'
import { getQueryClient, trpc } from '@/trpc/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'Casting' }

type Props = { params: Promise<{ slug: string }> }

/** E7/E8 — casting page for approved interpreters. */
export default async function CastingPage({ params }: Props) {
  const { slug } = await params
  const data = await getQueryClient().fetchQuery(trpc.calls.getBySlug.queryOptions({ slug }))
  if (!data) notFound()

  return (
    <PageShell title={`Casting · ${data.call.title}`} description='Escolha personagens e envie sua interpretação de até 30 segundos.'>
      <Link href={`/editais/${slug}`} className='text-xs text-text-muted hover:text-text-secondary self-start'>
        ← Voltar ao edital
      </Link>
      <div className='max-w-[720px]'>
        <CastingBoard callId={data.call.id} slug={slug} phase={data.call.phase} />
      </div>
    </PageShell>
  )
}
