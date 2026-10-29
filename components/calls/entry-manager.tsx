'use client'

import { EntryForm } from '@/components/calls/entry-form'
import { MyEntry } from '@/components/calls/my-entry'
import { LoadingState } from '@/components/shared/loading-state'
import { SectionHeading } from '@/components/shared/section-heading'
import type { CallPhase } from '@/lib/constants/calls'
import { useCallEntries } from '@/lib/hooks/use-call-entries'

interface EntryManagerProps {
  callId: string
  phase: CallPhase
}

/** E3–E5 — the author's entries in a call and, while open, the form to enter another script. */
export function EntryManager({ callId, phase }: EntryManagerProps) {
  const isOpen = phase === 'submissions'
  const { eligibleScripts, entries, isLoading, isSaving, enter, updateCharacters, withdraw } = useCallEntries(callId, {
    canSubmit: isOpen,
  })

  if (isLoading) return <LoadingState label='inscrições' />

  return (
    <div className='flex flex-col gap-10'>
      {entries.length > 0 && (
        <section className='flex flex-col gap-4'>
          <SectionHeading>Minhas inscrições</SectionHeading>
          {entries.map((entry) => (
            <MyEntry
              key={entry.id}
              entry={entry}
              canEdit={isOpen}
              isSaving={isSaving}
              onSaveCharacters={(drafts, onDone) => updateCharacters(entry.id, drafts, onDone)}
              onWithdraw={() => withdraw(entry.id)}
            />
          ))}
        </section>
      )}

      {isOpen ? (
        <section className='flex flex-col gap-4'>
          <SectionHeading>{entries.length > 0 ? 'Inscrever outro roteiro' : 'Nova inscrição'}</SectionHeading>
          <EntryForm scripts={eligibleScripts} isSaving={isSaving} onSubmit={enter} />
        </section>
      ) : (
        entries.length === 0 && <p className='text-body-small text-text-muted'>As inscrições deste edital estão encerradas.</p>
      )}
    </div>
  )
}
