import { PublishPage } from '@/components/publish/publish-page'
import { Suspense } from 'react'

interface PublishRouteProps {
  searchParams: Promise<{
    id?: string
  }>
}

export default async function PublishRoute({ searchParams }: PublishRouteProps) {
  const resolvedSearchParams = await searchParams

  return (
    <Suspense
      fallback={
        <div className='max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-12'>
          <p className='text-text-muted'>Carregando editor...</p>
        </div>
      }>
      <PublishPage scriptId={resolvedSearchParams.id} />
    </Suspense>
  )
}
