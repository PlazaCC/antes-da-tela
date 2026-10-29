'use client'

import type { InterpreterModality } from '@/lib/constants/interpreters'
import type { CharacterEntry } from '@/lib/hooks/use-character-entries'
import type { CallCharacter, EligibleScript } from '@/lib/types/calls'
import type { CallCharacterInput } from '@/lib/validators/calls'
import { useState } from 'react'

/** A character being described for a call entry: the publish fields + casting info. */
export type CallCharacterDraft = CharacterEntry & { modalities: InterpreterModality[]; reference: string }

const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`)

export function emptyDraft(): CallCharacterDraft {
  return { id: newId(), name: '', description: '', apparentAge: '', gender: '', traits: [], modalities: ['acting'], reference: '' }
}

/** Seeds drafts from the script's cast (new entry) or the entry's characters (editing). */
export function toDrafts(characters: EligibleScript['characters'] | CallCharacter[]): CallCharacterDraft[] {
  return characters.map((c) => ({
    ...emptyDraft(),
    name: c.name,
    description: c.description ?? '',
    apparentAge: c.apparentAge ?? '',
    gender: c.gender ?? '',
    traits: c.traits,
    ...('modalities' in c ? { modalities: c.modalities, reference: c.reference ?? '' } : {}),
  }))
}

export function toCharacterInputs(drafts: CallCharacterDraft[]): CallCharacterInput[] {
  return drafts.map((d) => ({
    name: d.name.trim(),
    description: d.description || undefined,
    apparentAge: d.apparentAge || undefined,
    gender: d.gender || undefined,
    traits: d.traits,
    modalities: d.modalities,
    reference: d.reference || undefined,
  }))
}

export function useCallCharacters(initial: CallCharacterDraft[] = []) {
  const [drafts, setDrafts] = useState<CallCharacterDraft[]>(initial)

  return {
    drafts,
    setDrafts,
    add: () => setDrafts((list) => [...list, emptyDraft()]),
    remove: (id: string) => setDrafts((list) => list.filter((d) => d.id !== id)),
    update: (id: string, patch: Partial<CallCharacterDraft>) =>
      setDrafts((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d))),
    isValid: drafts.length > 0 && drafts.every((d) => d.name.trim() && d.modalities.length > 0),
  }
}
