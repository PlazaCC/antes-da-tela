import { MetricCard } from '@/components/dashboard/metric-card'
import { RatingInfo } from '@/components/rating-info'
import type { ScriptInsights } from '@/lib/types/script-insights'
import { formatCount } from '@/lib/utils/format-count'
import { MIN_READERS_FOR_RATES, newReadersTrend, readRate } from '@/lib/utils/read-rate'
import { CommentsByPage } from './comments-by-page'
import { InsightsHeader } from './insights-header'
import { InsightsSection } from './insights-section'
import { ReactionsSummary } from './reactions-summary'
import { ReadingProgress } from './reading-progress'
import { WhereReadersStop } from './where-readers-stop'

/** Author-only metrics for one script: who reads and how far, ratings, comments and reactions. */
export function ScriptInsightsView({ insights }: { insights: ScriptInsights }) {
  const { script, ratings, comments, reactions, reads } = insights
  const completionRate = readRate(reads.completed, reads.readers)

  return (
    <div className='flex flex-col gap-8'>
      <InsightsHeader script={script} />

      <div className='grid grid-cols-2 md:flex md:flex-row gap-4 md:gap-6'>
        <MetricCard
          value={String(reads.readers)}
          label='Leitores'
          trend={newReadersTrend(reads.newLast30)}
          trendColor='neutral'
        />
        <MetricCard
          value={completionRate !== null ? `${completionRate}%` : '--'}
          label='Leram até o fim'
          trend={completionRate === null && reads.readers > 0 ? `a partir de ${MIN_READERS_FOR_RATES} leitores` : undefined}
          trendColor='neutral'
        />
        <MetricCard
          value={ratings.average !== null ? `${ratings.average.toFixed(1)} ★` : '--'}
          label='Avaliação média'
          trend={ratings.count > 0 ? formatCount(ratings.count, 'avaliação', 'avaliações') : undefined}
          trendColor='neutral'
        />
        <MetricCard
          value={String(comments.total)}
          label='Comentários recebidos'
          trend={comments.uniqueCommenters > 0 ? formatCount(comments.uniqueCommenters, 'pessoa', 'pessoas') : undefined}
          trendColor='neutral'
        />
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        <InsightsSection title='Até onde leem' description='Leitores com login que abriram o roteiro.'>
          <ReadingProgress reads={reads} />
        </InsightsSection>
        <InsightsSection title='Onde param' description='Última página lida por quem não terminou.'>
          <WhereReadersStop reads={reads} pageCount={script.pageCount} />
        </InsightsSection>
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
