'use client'

import { FormField } from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Call, CallEntry } from '@/lib/types/calls'
import { toDateTimeLocal } from '@/lib/utils/format-date'
import { callResultSchema, type CallResultInput } from '@/lib/validators/votes'
import { useState } from 'react'

interface CallResultsFormProps {
  call: Call
  entries: CallEntry[]
  counts: Record<string, number> | null
  isSaving: boolean
  onSave: (input: CallResultInput) => void
}

const blank = (value: string) => (value.trim() ? value.trim() : null)

/** A5 — vote totals, the winner and the live/recording links. */
export function CallResultsForm({ call, entries, counts, isSaving, onSave }: CallResultsFormProps) {
  const r = call.result
  const [winner, setWinner] = useState(r.winnerEntryId ?? '')
  const [liveAt, setLiveAt] = useState(toDateTimeLocal(r.liveAt))
  const [links, setLinks] = useState({ liveUrl: r.liveUrl ?? '', ticketUrl: r.ticketUrl ?? '', recordingUrl: r.recordingUrl ?? '' })
  const [price, setPrice] = useState(r.ticketPriceCents !== null ? (r.ticketPriceCents / 100).toFixed(2) : '')
  const [share, setShare] = useState(r.castSharePercent?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)
  const approved = entries.filter((e) => e.status === 'approved').sort((a, b) => (counts?.[b.id] ?? 0) - (counts?.[a.id] ?? 0))

  const submit = () => {
    const parsed = callResultSchema.safeParse({
      callId: call.id,
      winnerEntryId: winner || null,
      liveAt: liveAt ? new Date(liveAt) : null,
      liveUrl: blank(links.liveUrl),
      ticketUrl: blank(links.ticketUrl),
      recordingUrl: blank(links.recordingUrl),
      ticketPriceCents: price ? Math.round(Number(price.replace(',', '.')) * 100) : null,
      castSharePercent: share ? Number(share) : null,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos')
      return
    }
    setError(null)
    onSave(parsed.data)
  }

  return (
    <div className='flex flex-col gap-5'>
      <FormField label='Vencedor' helperText='Votos parciais visíveis só para a equipe até o edital ser encerrado.'>
        <div className='flex flex-col gap-2'>
          {approved.map((entry) => (
            <label key={entry.id} className='flex items-center gap-3 text-body-small text-text-secondary cursor-pointer'>
              <input type='radio' name='winner' checked={winner === entry.id} onChange={() => setWinner(entry.id)} />
              <span className='flex-1'>{entry.script.title}</span>
              <span className='font-mono text-xs'>{counts?.[entry.id] ?? 0} votos</span>
            </label>
          ))}
        </div>
      </FormField>
      <div className='grid gap-4 md:grid-cols-2'>
        <FormField label='Data da live'>
          <Input type='datetime-local' value={liveAt} onChange={(e) => setLiveAt(e.target.value)} />
        </FormField>
        <FormField label='Link da live'>
          <Input value={links.liveUrl} onChange={(e) => setLinks({ ...links, liveUrl: e.target.value })} placeholder='https://' />
        </FormField>
        <FormField label='Link do ingresso'>
          <Input value={links.ticketUrl} onChange={(e) => setLinks({ ...links, ticketUrl: e.target.value })} placeholder='https://' />
        </FormField>
        <FormField label='Preço do ingresso (R$)'>
          <Input inputMode='decimal' value={price} onChange={(e) => setPrice(e.target.value)} placeholder='1,99' />
        </FormField>
        <FormField label='% para o elenco'>
          <Input inputMode='numeric' value={share} onChange={(e) => setShare(e.target.value)} placeholder='50' />
        </FormField>
        <FormField label='Link da gravação'>
          <Input value={links.recordingUrl} onChange={(e) => setLinks({ ...links, recordingUrl: e.target.value })} placeholder='https://' />
        </FormField>
      </div>
      {error && <p className='text-state-error text-xs font-mono'>{error}</p>}
      <Button type='button' onClick={submit} disabled={isSaving} className='self-start h-11'>
        Salvar resultado
      </Button>
    </div>
  )
}
