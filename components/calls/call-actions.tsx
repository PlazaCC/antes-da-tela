import { Button } from '@/components/ui/button'
import type { CallSummary } from '@/lib/types/calls'
import Link from 'next/link'

/** E2 — what the visitor can do now, by phase. */
export function CallActions({ call }: { call: CallSummary }) {
  const base = `/editais/${call.slug}`

  switch (call.phase) {
    case 'submissions':
      return (
        <Button asChild className='h-11'>
          <Link href={`${base}/inscricao`}>Inscrever meu roteiro</Link>
        </Button>
      )
    case 'casting':
      return (
        <div className='flex flex-col gap-2'>
          <Button asChild className='h-11'>
            <Link href={`${base}/casting`}>Ver personagens (intérpretes)</Link>
          </Button>
          <Button asChild variant='outline' className='h-11'>
            <Link href={`${base}/inscricao`}>Minhas inscrições</Link>
          </Button>
        </div>
      )
    case 'curation':
      return (
        <Button asChild variant='outline' className='h-11'>
          <Link href={`${base}/inscricao`}>Escolher elenco (roteiristas)</Link>
        </Button>
      )
    case 'voting':
      return (
        <Button asChild className='h-11'>
          <Link href={`${base}#roteiros`}>Ver roteiros e votar</Link>
        </Button>
      )
    case 'finished':
      return null
    default:
      return (
        <Button asChild variant='outline' className='h-11'>
          <Link href={`${base}/inscricao`}>Minhas inscrições</Link>
        </Button>
      )
  }
}
