import { LegalPlaceholderNote, LegalSection, LegalShell } from '@/components/legal/legal-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Perguntas frequentes sobre a Antes da Tela.',
}

export default function FaqPage() {
  return (
    <LegalShell title='Perguntas Frequentes' subtitle='Dúvidas comuns sobre a plataforma.'>
      <LegalPlaceholderNote />
      <LegalSection heading='O que é a Antes da Tela?'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
      <LegalSection heading='Como publico um roteiro?'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
      <LegalSection heading='Preciso registrar minha obra para publicar?'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
      <LegalSection heading='Como funciona a curadoria e os comentários?'>
        <p>Conteúdo a ser definido.</p>
      </LegalSection>
    </LegalShell>
  )
}
