'use client'

import { CharacterDetails } from '@/components/casting/character-details'
import { TakeCard } from '@/components/casting/take-card'
import { LoadingState } from '@/components/shared/loading-state'
import { Button } from '@/components/ui/button'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { toast } from 'sonner'

/** E6 — the author chooses one of the (up to 3) finalists per character. */
export function CastPicker({ entryId, canChoose }: { entryId: string; canChoose: boolean }) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data: characters, isLoading } = useQuery(trpc.casting.shortlist.queryOptions({ entryId }))
  const select = useMutation(
    trpc.casting.selectCast.mutationOptions({
      onSuccess: () => {
        posthog.capture('cast_selected', { entryId })
        toast.success('Elenco atualizado.')
        void queryClient.invalidateQueries(trpc.casting.shortlist.queryFilter({ entryId }))
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  if (isLoading) return <LoadingState label='finalistas' />

  return (
    <div className='flex flex-col gap-6 rounded-sm border border-border-default bg-surface p-5'>
      <p className='text-body-small text-text-secondary'>
        {canChoose ? 'A curadoria selecionou até 3 opções por personagem. Escolha quem interpreta cada um.' : 'Elenco escolhido.'}
      </p>
      {characters?.map((character) => (
        <section key={character.id} className='flex flex-col gap-3'>
          <CharacterDetails character={character} />
          {character.takes.length === 0 ? (
            <p className='text-xs text-text-muted'>A curadoria ainda não indicou finalistas para este personagem.</p>
          ) : (
            <div className='grid gap-3 md:grid-cols-3'>
              {character.takes.map((take) => (
                <TakeCard
                  key={take.id}
                  take={take}
                  highlighted={take.status === 'selected'}
                  actions={
                    canChoose &&
                    take.status !== 'selected' && (
                      <Button type='button' size='sm' disabled={select.isPending} onClick={() => select.mutate({ submissionId: take.id })}>
                        Escolher
                      </Button>
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
