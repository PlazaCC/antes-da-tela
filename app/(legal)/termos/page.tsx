import { LegalPlaceholderNote, LegalSection, LegalShell } from '@/components/legal/legal-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de uso da plataforma Antes da Tela.',
}

export default function TermosPage() {
  return (
    <LegalShell title='Termos de Uso' subtitle='As regras para uso da plataforma Antes da Tela.'>
      <LegalPlaceholderNote />
      <LegalSection heading='1. Aceitação dos termos'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
      <LegalSection heading='2. Uso da plataforma'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
      <LegalSection heading='3. Conteúdo do usuário e direitos autorais'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
      <LegalSection heading='4. Limitação de responsabilidade'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
    </LegalShell>
  )
}
