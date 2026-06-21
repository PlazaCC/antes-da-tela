'use client'

import { DEFAULT_AUDIO_CATEGORY, type AudioCategory } from '@/lib/constants/scripts'
import { useState } from 'react'

/** A single audio attachment being edited in the publish flow. */
export interface AudioEntry {
  /** Stable client id (also reused from the DB row id when editing). */
  id: string
  /** Newly picked file pending upload, or null when only an existing path is present. */
  file: File | null
  /** Existing S3 key (set on edit-load or after upload). */
  storagePath: string
  title: AudioCategory
  description: string
  durationSeconds?: number
  progress: number
  error: string
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`

function createEntry(): AudioEntry {
  return {
    id: newId(),
    file: null,
    storagePath: '',
    title: DEFAULT_AUDIO_CATEGORY,
    description: '',
    progress: 0,
    error: '',
  }
}

export interface UseAudioEntriesResult {
  entries: AudioEntry[]
  addEntry: () => void
  removeEntry: (id: string) => void
  updateEntry: (id: string, patch: Partial<AudioEntry>) => void
  setEntries: (entries: AudioEntry[]) => void
  reset: () => void
}

export function useAudioEntries(): UseAudioEntriesResult {
  const [entries, setEntries] = useState<AudioEntry[]>([])

  const addEntry = () => setEntries((prev) => [...prev, createEntry()])

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((entry) => entry.id !== id))

  const updateEntry = (id: string, patch: Partial<AudioEntry>) =>
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)))

  const reset = () => setEntries([])

  return { entries, addEntry, removeEntry, updateEntry, setEntries, reset }
}
