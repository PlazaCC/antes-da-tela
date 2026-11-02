'use client'

import { ShareButton } from '@/components/calls/share-button'
import { DocumentFields } from '@/components/profile/document-fields'
import { Button } from '@/components/ui/button'
import { useDocumentForm } from '@/lib/hooks/use-document-form'
import { useVote } from '@/lib/hooks/use-vote'
import Link from 'next/link'

interface VotePanelProps {
  callId: string
  entryId: string
  /** This page's path, to come back after sign-up and to share. */
  path: string
  shareText: string
}

/** V1–V3 — the shortest path from a shared link to a vote. */
export function VotePanel({ callId, entryId, path, shareText }: VotePanelProps) {
  const { state, isVoting, vote } = useVote(callId, entryId)
  const next = encodeURIComponent(path)

  return (
    <section className='rounded-sm border border-brand-accent/40 bg-surface p-5 flex flex-col gap-4'>
      {state === 'loading' && <p className='text-body-small text-text-muted'>Carregando…</p>}
      {state === 'signed-out' && (
        <>
          <p className='text-body-small text-text-secondary'>Crie sua conta em poucos segundos para votar. Cada pessoa vota uma vez por edital.</p>
          <Button asChild className='h-11'>
            <Link href={`/auth/sign-up?next=${next}`}>Cadastrar e votar</Link>
          </Button>
          <Link href={`/auth/login?next=${next}`} className='text-xs text-text-muted underline underline-offset-2 self-start'>
            Já tenho conta
          </Link>
        </>
      )}
      {state === 'needs-email' && (
        <p className='text-body-small text-text-secondary'>Confirme seu e-mail (enviamos um link/código no cadastro) e volte a esta página para votar.</p>
      )}
      {state === 'needs-document' && <DocumentStep />}
      {state === 'can-vote' && (
        <Button className='h-11' disabled={isVoting} onClick={vote}>
          {isVoting ? 'Registrando…' : 'Votar neste roteiro'}
        </Button>
      )}
      {state === 'voted-here' && <p className='font-medium text-text-primary'>Seu voto foi registrado neste roteiro. Obrigado!</p>}
      {state === 'voted-elsewhere' && <p className='text-body-small text-text-secondary'>Você já votou em outro roteiro deste edital.</p>}
      <ShareButton path={path} text={shareText} label={state === 'voted-here' ? 'Chame mais gente para votar' : 'Compartilhar'} />
    </section>
  )
}

/** V2 — identity document, required to vote (one vote per person). */
function DocumentStep() {
  const { form, submit, isSaving } = useDocumentForm()
  return (
    <form onSubmit={submit} className='flex flex-col gap-4'>
      <p className='text-body-small text-text-secondary'>
        Para garantir um voto por pessoa, confirme um documento. Só você vê esse dado, e ele aparece mascarado.
      </p>
      <DocumentFields form={form} />
      <Button type='submit' disabled={isSaving} className='h-11'>
        {isSaving ? 'Salvando…' : 'Salvar e continuar'}
      </Button>
    </form>
  )
}
