import { AmbassadorCard } from '@/components/ambassadors/ambassador-card'
import { AmbassadorsCta } from '@/components/ambassadors/ambassadors-cta'
import { AmbassadorsHero } from '@/components/ambassadors/ambassadors-hero'
import { AmbassadorsSectionHeading } from '@/components/ambassadors/section-heading'
import { SupportersCredits } from '@/components/ambassadors/supporters-credits'
import { TestimonialDialogue } from '@/components/ambassadors/testimonial-dialogue'
import { AMBASSADORS, SUPPORTERS, TESTIMONIALS } from '@/content/embaixadores'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Embaixadores',
  description:
    'Roteiristas, produtores, curadores e pesquisadores que acreditam no Antes da Tela e ajudam a levar novas histórias da página até a tela.',
}

const SECTION = 'border-t border-border-default'
const CONTAINER = 'mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-14 md:gap-12 md:px-8 md:py-24'

export default function AmbassadorsPage() {
  return (
    <main className='bg-background'>
      <AmbassadorsHero />

      <section aria-labelledby='elenco' className={SECTION}>
        <div className={CONTAINER}>
          <AmbassadorsSectionHeading
            id='elenco'
            title='Embaixadores'
            intro='Gente do mercado que leu, testou e assina embaixo. Cada um ajuda a curar, divulgar e dar retorno aos roteiros publicados.'
          />
          <ul className='-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-4'>
            {AMBASSADORS.map((ambassador) => (
              <li key={ambassador.slug} className='w-[78%] shrink-0 snap-start md:w-auto'>
                <AmbassadorCard ambassador={ambassador} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby='depoimentos' className={SECTION}>
        <div className={CONTAINER}>
          <AmbassadorsSectionHeading
            id='depoimentos'
            title='Deu match.'
            intro='Depoimentos de quem conheceu a plataforma, formatados como diálogo de roteiro.'
          />
          <ul className='grid gap-4 md:grid-cols-2 md:gap-6'>
            {TESTIMONIALS.map((testimonial) => (
              <li key={testimonial.author}>
                <TestimonialDialogue testimonial={testimonial} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby='creditos' className={SECTION}>
        <div className={CONTAINER}>
          <AmbassadorsSectionHeading id='creditos' title='Quem está com a gente' />
          <SupportersCredits supporters={SUPPORTERS} />
        </div>
      </section>

      <AmbassadorsCta />
    </main>
  )
}
