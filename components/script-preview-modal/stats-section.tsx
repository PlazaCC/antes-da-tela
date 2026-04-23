import { cn } from '@/lib/utils'
import { RatingInfo, StatItem } from '@/components/rating-info'

interface RatingDistribution {
  stars: number
  count: number
  percentage: number
}

interface StatsSectionProps {
  ratingData: { average: number; total: number } | undefined
  commentData: { count: number } | undefined
  distributionData: { distribution: RatingDistribution[]; total: number } | undefined
  className?: string
}

export function StatsSection({ ratingData, commentData, distributionData, className }: StatsSectionProps) {
  return (
    <div className={cn('flex flex-col gap-4 md:gap-6', className)}>
      <div className='flex gap-6 md:gap-10 overflow-x-auto md:overflow-visible pb-2 md:pb-0'>
        <StatItem value={ratingData?.total ?? 0} label='Avaliações' className='shrink-0' />
        <StatItem
          value={ratingData?.average ? ratingData.average.toFixed(1) : '—'}
          label='Nota média'
          className='shrink-0'
        />
        <StatItem value={commentData?.count ?? 0} label='Comentários' className='shrink-0' />
      </div>


      {distributionData && (
        <div className='bg-elevated/50 p-6 rounded-sm border border-border-default'>
          <RatingInfo
            distribution={distributionData.distribution}
            average={ratingData?.average ?? 0}
            total={distributionData.total}
          />
        </div>
      )}
    </div>
  )
}
