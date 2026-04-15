import { Suspense } from 'react'
import ScriptPageClient from './script-page-client'

export default async function ScriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-base flex items-center justify-center">
          <p className="text-text-secondary font-mono text-label-mono-default">Loading…</p>
        </div>
      }
    >
      <ScriptPageClient scriptId={id} />
    </Suspense>
  )
}
