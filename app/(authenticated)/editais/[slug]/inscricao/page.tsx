import { EntryManager } from '@/components/calls/entry-manager'
import { PageShell } from '@/components/shared/page-shell'
import { getQueryClient, trpc } from '@/trpc/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'Inscrição no edital' }

type Props = { params: Promise<{ slug: string }> }

/** E3–E5 — enter scripts in a call and follow the entries. */
export default async function CallEntryPage({ params }: Props) {
  const { slug } = await params
  const data = await getQueryClient().fetchQuery(trpc.calls.getBySlug.queryOptions({ slug }))
  if (!data) notFound()

  return (
    <PageShell title={`Inscrição · ${data.call.title}`} description='Escolha um roteiro publicado e descreva os personagens que você quer ver interpretados.'>
      <Link href={`/editais/${slug}`} className='text-xs text-text-muted hover:text-text-secondary self-start'>
        ← Voltar ao edital
      </Link>
      <div className='max-w-[720px]'>
        <EntryManager callId={data.call.id} phase={data.call.phase} />
      </div>
    </PageShell>
  )
}
