'use client'

import { CastingCuration } from '@/components/admin/casting-curation'
import { PageShell } from '@/components/shared/page-shell'
import Link from 'next/link'
import { use } from 'react'

/** A4 — casting curation of a call. */
export default function AdminCastingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <PageShell title='Curadoria de casting' description='Indique até 3 finalistas por personagem; o roteirista escolhe entre eles na fase de curadoria.'>
      <Link href={`/admin/editais/${id}`} className='text-xs text-text-muted hover:text-text-secondary self-start'>
        ← Voltar ao edital
      </Link>
      <CastingCuration callId={id} />
    </PageShell>
  )
}
