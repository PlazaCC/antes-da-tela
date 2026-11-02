'use client'

import { OpenCharacterCard } from '@/components/casting/open-character-card'
import { ChipGroup } from '@/components/preferences/chip-group'
import { LoadingState } from '@/components/shared/loading-state'
import { Button } from '@/components/ui/button'
import type { CallPhase } from '@/lib/constants/calls'
import { INTERPRETER_MODALITIES, MODALITY_LABELS, type InterpreterModality } from '@/lib/constants/interpreters'
import { useCasting } from '@/lib/hooks/use-casting'
import Link from 'next/link'
import { useState } from 'react'

const NOT_APPROVED = {
  pending: 'Seu cadastro de intérprete está em curadoria. Assim que for aprovado, os personagens aparecem aqui.',
  rejected: 'Seu cadastro de intérprete não foi aprovado. Envie um novo material na sua área de intérprete.',
} as const

/** E7 — characters of a call open to the interpreter, filterable by modality. */
export function CastingBoard({ callId, slug, phase }: { callId: string; slug: string; phase: CallPhase }) {
  const { interpreterStatus, characters, isLoading, isSaving, submit, withdraw } = useCasting(callId)
  const [filter, setFilter] = useState<InterpreterModality | null>(null)

  if (isLoading) return <LoadingState label='personagens' />

  if (interpreterStatus !== 'approved') {
    return (
      <div className='rounded-sm border border-dashed border-border-default p-6 flex flex-col gap-3 items-start'>
        <p className='text-body-small text-text-secondary'>
          {interpreterStatus ? NOT_APPROVED[interpreterStatus] : 'Para participar do casting, faça seu cadastro de intérprete.'}
        </p>
        <Button asChild variant='outline'>
          <Link href='/profile/interpreter'>Área do intérprete</Link>
        </Button>
      </div>
    )
  }

  const visible = filter ? characters.filter((c) => c.modalities.includes(filter)) : characters
  const isOpen = phase === 'casting'

  return (
    <div className='flex flex-col gap-6'>
      {!isOpen && <p className='text-body-small text-text-muted'>O casting deste edital está fechado. Você ainda vê seus envios.</p>}
      <ChipGroup
        options={INTERPRETER_MODALITIES}
        selected={filter ? [filter] : []}
        getLabel={(option) => MODALITY_LABELS[option as InterpreterModality]}
        onToggle={(option) => setFilter(filter === option ? null : (option as InterpreterModality))}
      />
      {visible.length === 0 && <p className='text-body-small text-text-muted'>Nenhum personagem compatível com suas modalidades.</p>}
      {visible.map((character) => (
        <OpenCharacterCard key={character.id} character={character} slug={slug} isOpen={isOpen} isSaving={isSaving} onSubmit={submit} onWithdraw={withdraw} />
      ))}
    </div>
  )
}
