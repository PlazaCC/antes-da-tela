import { Skeleton } from '@/components/ui/skeleton'

export function ScriptPageSkeleton() {
  return (
    <main className='min-h-screen bg-bg-base px-5 py-8'>
      <div className='mx-auto max-w-[1140px] space-y-8'>
        <div className='space-y-4'>
          <Skeleton className='h-14 w-5/6 rounded-full bg-elevated' />
          <Skeleton className='h-8 w-2/3 rounded-full bg-elevated' />
          <div className='flex flex-wrap gap-3'>
            <Skeleton className='h-9 w-24 rounded-full bg-elevated' />
            <Skeleton className='h-9 w-28 rounded-full bg-elevated' />
            <Skeleton className='h-9 w-20 rounded-full bg-elevated' />
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-[1.35fr_0.65fr]'>
          <div className='space-y-6'>
            <Skeleton className='h-[320px] rounded-lg bg-elevated' />
            <div className='grid gap-4 md:grid-cols-2'>
              <Skeleton className='h-56 rounded-lg bg-elevated' />
              <Skeleton className='h-56 rounded-lg bg-elevated' />
            </div>
            <div className='space-y-3 rounded-lg border border-border-subtle/70 bg-bg-base p-5'>
              <Skeleton className='h-5 w-1/4 rounded-full bg-elevated' />
              <Skeleton className='h-4 w-full rounded-full bg-elevated' />
              <Skeleton className='h-4 w-5/6 rounded-full bg-elevated' />
              <Skeleton className='h-4 w-3/4 rounded-full bg-elevated' />
            </div>
          </div>

          <aside className='space-y-6'>
            <div className='space-y-3 rounded-lg border border-border-subtle/70 bg-bg-base p-5'>
              <Skeleton className='h-6 w-28 rounded-full bg-elevated' />
              <Skeleton className='h-12 w-full rounded-full bg-elevated' />
              <Skeleton className='h-4 w-2/3 rounded-full bg-elevated' />
              <Skeleton className='h-4 w-1/2 rounded-full bg-elevated' />
            </div>
            <div className='space-y-4 rounded-lg border border-border-subtle/70 bg-bg-base p-5'>
              <Skeleton className='h-6 w-32 rounded-full bg-elevated' />
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className='space-y-2'>
                  <Skeleton className='h-4 w-1/2 rounded-full bg-elevated' />
                  <Skeleton className='h-4 w-full rounded-full bg-elevated' />
                </div>
              ))}
            </div>
            <div className='space-y-4 rounded-lg border border-border-subtle/70 bg-bg-base p-5'>
              <Skeleton className='h-6 w-32 rounded-full bg-elevated' />
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className='space-y-2'>
                  <Skeleton className='h-4 w-full rounded-full bg-elevated' />
                  <Skeleton className='h-4 w-5/6 rounded-full bg-elevated' />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
