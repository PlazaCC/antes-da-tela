import { Skeleton } from '@/components/ui/skeleton'

export function HomeSkeleton() {
  return (
    <div className='w-full bg-bg-base'>
      <div className='w-full overflow-hidden'>
        <Skeleton className='h-[32rem] w-full bg-elevated' />
      </div>

      <main className='mx-auto px-5 pt-8 pb-16 flex flex-col gap-12'>
        <div className='flex flex-wrap items-center gap-3'>
          <Skeleton className='h-8 w-24 rounded-full bg-elevated' />
          <Skeleton className='h-8 w-24 rounded-full bg-elevated' />
          <Skeleton className='h-8 w-24 rounded-full bg-elevated' />
          <Skeleton className='h-8 w-24 rounded-full bg-elevated' />
        </div>

        <section className='grid gap-6'>
          <Skeleton className='h-10 w-48 rounded-full bg-elevated' />
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className='space-y-4 rounded-sm border border-border-subtle/70 bg-bg-base p-4'>
                <Skeleton className='h-48 rounded-sm bg-elevated' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-3/5 rounded-full bg-elevated' />
                  <Skeleton className='h-4 w-1/2 rounded-full bg-elevated' />
                  <Skeleton className='h-3 w-2/5 rounded-full bg-elevated' />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='space-y-5'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <Skeleton className='h-10 w-40 rounded-full bg-elevated' />
            <div className='flex flex-wrap gap-3'>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className='h-8 w-20 rounded-full bg-elevated' />
              ))}
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6'>
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className='space-y-3 rounded-sm border border-border-subtle/70 bg-bg-base p-4'>
                <Skeleton className='h-52 rounded-sm bg-elevated' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-5/6 rounded-full bg-elevated' />
                  <Skeleton className='h-4 w-2/3 rounded-full bg-elevated' />
                  <div className='flex gap-2'>
                    <Skeleton className='h-4 w-12 rounded-full bg-elevated' />
                    <Skeleton className='h-4 w-14 rounded-full bg-elevated' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
