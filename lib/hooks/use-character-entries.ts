'use client'

import { useState } from 'react'

/** A character being edited in the publish flow (optional cast step). */
export interface CharacterEntry {
  /** Stable client id (also reused from the DB row id when editing). */
  id: string
  name: string
  description: string
  apparentAge: string
  gender: string
  traits: string[]
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`

function createEntry(): CharacterEntry {
  return { id: newId(), name: '', description: '', apparentAge: '', gender: '', traits: [] }
}

export interface UseCharacterEntriesResult {
  entries: CharacterEntry[]
  addEntry: () => void
  removeEntry: (id: string) => void
  updateEntry: (id: string, patch: Partial<CharacterEntry>) => void
  setEntries: (entries: CharacterEntry[]) => void
  reset: () => void
}

export function useCharacterEntries(): UseCharacterEntriesResult {
  const [entries, setEntries] = useState<CharacterEntry[]>([])

  const addEntry = () => setEntries((prev) => [...prev, createEntry()])

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((entry) => entry.id !== id))

  const updateEntry = (id: string, patch: Partial<CharacterEntry>) =>
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)))

  const reset = () => setEntries([])

  return { entries, addEntry, removeEntry, updateEntry, setEntries, reset }
}
