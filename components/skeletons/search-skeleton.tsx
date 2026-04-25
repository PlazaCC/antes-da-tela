import { Skeleton } from '@/components/ui/skeleton'

export function SearchSkeleton() {
  return (
    <main className='w-full mx-auto px-2 pb-16'>
      <div className='flex flex-col gap-5'>
        <div className='space-y-3'>
          <Skeleton className='h-6 w-[220px] rounded-full bg-elevated' />
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className='space-y-3 rounded-sm border border-border-subtle/70 bg-bg-base p-4'>
              <Skeleton className='h-56 rounded-sm bg-elevated' />
              <Skeleton className='h-4 w-3/4 rounded-full bg-elevated' />
              <Skeleton className='h-4 w-1/2 rounded-full bg-elevated' />
              <div className='flex gap-2'>
                <Skeleton className='h-4 w-14 rounded-full bg-elevated' />
                <Skeleton className='h-4 w-14 rounded-full bg-elevated' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
