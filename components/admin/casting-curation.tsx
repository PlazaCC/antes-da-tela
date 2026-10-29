'use client'

import { CharacterDetails } from '@/components/casting/character-details'
import { TakeCard } from '@/components/casting/take-card'
import { LoadingState } from '@/components/shared/loading-state'
import { Button } from '@/components/ui/button'
import { MAX_SHORTLIST } from '@/lib/constants/casting'
import type { CastingTake } from '@/lib/types/casting'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type AdminStatus = 'submitted' | 'shortlisted' | 'rejected'

/** A4 — every take per character; mark up to 3 finalists, or refuse. */
export function CastingCuration({ callId }: { callId: string }) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data: characters, isLoading } = useQuery(trpc.admin.listCastings.queryOptions({ callId }))
  const mutation = useMutation(
    trpc.admin.setCastingStatus.mutationOptions({
      onSuccess: () => void queryClient.invalidateQueries(trpc.admin.listCastings.queryFilter({ callId })),
      onError: (error) => toast.error(error.message),
    }),
  )
  const set = (take: CastingTake, status: AdminStatus) => mutation.mutate({ submissionId: take.id, status })

  if (isLoading) return <LoadingState label='castings' />
  if (!characters?.length) return <p className='text-body-small text-text-muted'>Nenhum personagem em inscrições aprovadas.</p>

  return (
    <div className='flex flex-col gap-10'>
      {characters.map((character) => {
        const finalists = character.takes.filter((t) => t.status === 'shortlisted' || t.status === 'selected').length
        return (
          <section key={character.id} className='flex flex-col gap-4'>
            <CharacterDetails character={character} />
            <p className='font-mono text-xs text-text-muted'>
              {character.takes.length} envios · finalistas {finalists}/{MAX_SHORTLIST}
            </p>
            <div className='grid gap-3 md:grid-cols-3'>
              {character.takes.map((take) => (
                <TakeCard
                  key={take.id}
                  take={take}
                  highlighted={take.status !== 'submitted' && take.status !== 'rejected'}
                  actions={
                    take.status !== 'selected' && (
                      <div className='flex flex-wrap gap-2'>
                        {take.status === 'shortlisted' ? (
                          <Button size='sm' variant='outline' disabled={mutation.isPending} onClick={() => set(take, 'submitted')}>
                            Tirar dos finalistas
                          </Button>
                        ) : (
                          <Button size='sm' disabled={mutation.isPending || finalists >= MAX_SHORTLIST} onClick={() => set(take, 'shortlisted')}>
                            Marcar finalista
                          </Button>
                        )}
                        {take.status !== 'rejected' && (
                          <Button size='sm' variant='ghost' disabled={mutation.isPending} onClick={() => set(take, 'rejected')}>
                            Recusar
                          </Button>
                        )}
                      </div>
                    )
                  }
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
