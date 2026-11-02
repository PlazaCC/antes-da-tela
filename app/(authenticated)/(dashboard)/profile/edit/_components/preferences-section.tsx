'use client'

import { PreferencesFields } from '@/components/preferences/preferences-fields'
import { LoadingState } from '@/components/shared/loading-state'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import { usePreferencesForm } from '@/lib/hooks/use-preferences-form'

/** P2 — the onboarding survey, editable any time. */
export function PreferencesSection() {
  const { values, toggle, isLoading, isPending, save } = usePreferencesForm({ source: 'profile' })

  if (isLoading) return <LoadingState label='preferências' />

  return (
    <section
      id='preferencias'
      className='bg-surface border border-border-default rounded-sm p-5 md:p-8 flex flex-col gap-6 shadow-sm'>
      <div>
        <SectionHeading>Preferências de conteúdo</SectionHeading>
        <p className='text-body-small text-text-secondary'>Usamos para recomendar roteiros e editais para você.</p>
      </div>
      <PreferencesFields values={values} onToggle={toggle} />
      <Button type='button' onClick={save} disabled={isPending} className='w-full md:w-[200px] h-11'>
        {isPending ? 'Salvando…' : 'Salvar preferências'}
      </Button>
    </section>
  )
}
