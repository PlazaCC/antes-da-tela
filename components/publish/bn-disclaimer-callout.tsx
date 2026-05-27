import { ShieldAlert } from 'lucide-react'

const BN_URL =
  'https://www.gov.br/pt-br/servicos/registrar-ou-averbar-direitos-autorais-na-biblioteca-nacional'

export function BnDisclaimerCallout() {
  return (
    <div className='p-4 bg-state-warning/5 border border-state-warning/20 rounded-sm flex gap-3 items-start'>
      <ShieldAlert size={18} className='text-state-warning shrink-0 mt-0.5' />
      <div className='flex flex-col gap-2'>
        <p className='text-xs text-text-secondary leading-relaxed'>
          O <strong className='text-text-primary'>Antes da Tela</strong> não se responsabiliza pelos
          direitos autorais das obras publicadas na plataforma. Ao publicar, você declara ser o
          autor ou possuir os direitos necessários sobre o conteúdo. Recomendamos o registro prévio
          da sua obra na Biblioteca Nacional do Brasil.
        </p>
        <a
          href={BN_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs font-mono text-brand-accent hover:underline self-start'>
          Registrar obra na Biblioteca Nacional →
        </a>
      </div>
    </div>
  )
}
