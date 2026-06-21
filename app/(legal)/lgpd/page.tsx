import { LegalPlaceholderNote, LegalSection, LegalShell } from '@/components/legal/legal-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LGPD',
  description: 'Tratamento de dados pessoais conforme a Lei Geral de Proteção de Dados.',
}

export default function LgpdPage() {
  return (
    <LegalShell
      title='LGPD'
      subtitle='Tratamento de dados pessoais conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).'>
      <LegalPlaceholderNote />
      <LegalSection heading='1. Controlador dos dados'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
      <LegalSection heading='2. Bases legais para o tratamento'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
      <LegalSection heading='3. Direitos do titular'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
      <LegalSection heading='4. Encarregado (DPO) e contato'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
    </LegalShell>
  )
}
