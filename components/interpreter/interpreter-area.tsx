'use client'

import { InterpreterForm } from '@/components/interpreter/interpreter-form'
import { InterpreterStatusCard } from '@/components/interpreter/interpreter-status-card'
import { LoadingState } from '@/components/shared/loading-state'
import { SectionHeading } from '@/components/shared/section-heading'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'

/** P3 — the interpreter's own area: status + (re)submission form. */
export function InterpreterArea() {
  const trpc = useTRPC()
  const { data: profile, isLoading } = useQuery(trpc.interpreters.getMine.queryOptions())

  if (isLoading) return <LoadingState label='cadastro de intérprete' />

  return (
    <div className='flex flex-col gap-8'>
      {profile && <InterpreterStatusCard profile={profile} />}
      {profile?.status !== 'pending' && (
        <section className='rounded-sm border border-border-default bg-surface p-5 md:p-8 flex flex-col gap-4'>
          <SectionHeading>{profile ? 'Enviar novo material' : 'Quero ser intérprete'}</SectionHeading>
          {profile?.status === 'approved' && (
            <p className='text-body-small text-text-secondary'>Ao enviar um novo material, seu cadastro volta para a curadoria.</p>
          )}
          <InterpreterForm key={profile?.updatedAt ?? 'new'} current={profile ?? null} />
        </section>
      )}
    </div>
  )
}
