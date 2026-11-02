'use client'

import { InterpreterReviewCard } from '@/components/admin/interpreter-review-card'
import { LoadingState } from '@/components/shared/loading-state'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useInterpreterReview } from '@/lib/hooks/use-interpreter-review'
import type { ReviewStatus } from '@/lib/types/interpreters'
import { useState } from 'react'

const TABS: ReadonlyArray<{ value: ReviewStatus; label: string; empty: string }> = [
  { value: 'pending', label: 'Pendentes', empty: 'Nenhum cadastro aguardando curadoria.' },
  { value: 'approved', label: 'Aprovados', empty: 'Nenhum intérprete aprovado ainda.' },
  { value: 'rejected', label: 'Reprovados', empty: 'Nenhum cadastro reprovado.' },
]

/** A1 — interpreter curation queue. */
export function InterpreterQueue() {
  const [status, setStatus] = useState<ReviewStatus>('pending')
  const { interpreters, isLoading, reviewingId, approve, reject } = useInterpreterReview(status)
  const tab = TABS.find((t) => t.value === status)!

  return (
    <div className='flex flex-col gap-6'>
      <Tabs value={status} onValueChange={(value) => setStatus(value as ReviewStatus)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {isLoading && <LoadingState label='intérpretes' />}
      {!isLoading && interpreters.length === 0 && <p className='text-body-small text-text-muted'>{tab.empty}</p>}
      {interpreters.map((interpreter) => (
        <InterpreterReviewCard
          key={interpreter.userId}
          interpreter={interpreter}
          isReviewing={reviewingId === interpreter.userId}
          onApprove={() => approve(interpreter.userId)}
          onReject={(reason) => reject(interpreter.userId, reason)}
        />
      ))}
    </div>
  )
}
