import { MetricCard } from '@/components/dashboard/metric-card'
import { RatingInfo } from '@/components/rating-info'
import type { ScriptInsights } from '@/lib/types/script-insights'
import { formatCount } from '@/lib/utils/format-count'
import { CommentsByPage } from './comments-by-page'
import { InsightsHeader } from './insights-header'
import { InsightsSection } from './insights-section'
import { ReactionsSummary } from './reactions-summary'

/** Author-only metrics for one script: ratings, where readers comment, reactions. */
export function ScriptInsightsView({ insights }: { insights: ScriptInsights }) {
  const { script, ratings, comments, reactions } = insights

  return (
    <div className='flex flex-col gap-8'>
      <InsightsHeader script={script} />

      <div className='grid grid-cols-2 md:flex md:flex-row gap-4 md:gap-6'>
        <MetricCard
          value={ratings.average !== null ? `${ratings.average.toFixed(1)} ★` : '--'}
          label='Avaliação média'
          trend={ratings.count > 0 ? formatCount(ratings.count, 'avaliação', 'avaliações') : undefined}
          trendColor='neutral'
        />
        <MetricCard value={String(comments.total)} label='Comentários recebidos' />
        <MetricCard value={String(comments.uniqueCommenters)} label='Pessoas que comentaram' />
        <MetricCard value='--' label='Leituras únicas' trend='em breve' trendColor='neutral' />
      </div>

      <div className='grid gap-6 lg:grid-cols-[2fr_1fr]'>
        <InsightsSection title='Onde os leitores comentam' description='Comentários de outras pessoas em cada página.'>
          <CommentsByPage byPage={comments.byPage} pageCount={script.pageCount} />
        </InsightsSection>
        <div className='flex flex-col gap-6'>
          <InsightsSection title='Avaliações'>
            {ratings.average !== null ? (
              <RatingInfo distribution={ratings.distribution} average={ratings.average} total={ratings.count} />
            ) : (
              <p className='text-body-small text-text-muted'>Ainda sem avaliações.</p>
            )}
          </InsightsSection>
          <InsightsSection title='Reações nos comentários'>
            <ReactionsSummary reactions={reactions} />
          </InsightsSection>
        </div>
      </div>
    </div>
  )
}
