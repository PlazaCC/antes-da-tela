'use client'

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
}

export function StatsSection({ ratingData, commentData, distributionData }: StatsSectionProps) {
  return (
    <>
      <div className='flex gap-10'>
        <StatItem value={ratingData?.total ?? 0} label='Avaliações' />
        <StatItem
          value={ratingData?.average ? ratingData.average.toFixed(1) : '—'}
          label='Nota média'
        />
        <StatItem value={commentData?.count ?? 0} label='Comentários' />
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
    </>
  )
}
