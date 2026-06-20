import { LegalPlaceholderNote, LegalSection, LegalShell } from '@/components/legal/legal-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Como a Antes da Tela coleta, usa e protege seus dados.',
}

export default function PrivacidadePage() {
  return (
    <LegalShell title='Política de Privacidade' subtitle='Como tratamos seus dados na Antes da Tela.'>
      <LegalPlaceholderNote />
      <LegalSection heading='1. Dados que coletamos'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
      <LegalSection heading='2. Como usamos seus dados'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
      <LegalSection heading='3. Compartilhamento de dados'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
      <LegalSection heading='4. Seus direitos'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
    </LegalShell>
  )
}
