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
    default:
      return (
        <Button asChild variant='outline' className='h-11'>
          <Link href={`${base}/inscricao`}>Minhas inscrições</Link>
        </Button>
      )
  }
}
