import { BookOpen } from 'lucide-react'

const BN_URL =
  'https://www.gov.br/pt-br/servicos/registrar-ou-averbar-direitos-autorais-na-biblioteca-nacional'

export function BnCalloutCard() {
  return (
    <div className='rounded-sm border border-border-subtle bg-surface p-4 flex gap-3 items-start'>
      <div className='w-8 h-8 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
        <BookOpen size={16} />
      </div>
      <div className='flex flex-col gap-1'>
        <p className='font-mono text-label-mono-small text-text-muted uppercase tracking-wider'>
          Proteja sua obra
        </p>
        <p className='text-body-small text-text-secondary leading-relaxed'>
          Registre seu roteiro na Biblioteca Nacional do Brasil e garanta seus direitos autorais
          sobre a obra.
        </p>
        <a
          href={BN_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs font-mono text-brand-accent hover:underline self-start mt-1'>
          Registrar na Biblioteca Nacional →
        </a>
      </div>
    </div>
  )
}
