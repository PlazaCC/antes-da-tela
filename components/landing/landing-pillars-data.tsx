import type { ReactNode } from 'react'

interface LandingPillar {
  verb: string
  title: string
  body: string
  icon: ReactNode
}

export const LANDING_PILLARS: LandingPillar[] = [
  {
    verb: 'Criar',
    title: 'Para publicar sua obra',
    body: 'Publique seu roteiro, sua série, seu universo ou sua ideia original. Organize a apresentação, adicione materiais de apoio e registre sua criação em um só lugar.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        width={28}
        height={28}
      >
        <path
          d="M3 21l3.5-1L20 6.5 17.5 4 4 17.5 3 21z"
          strokeLinejoin="round"
        />
        <path d="M14.5 6.5l3 3" />
      </svg>
    ),
  },
  {
    verb: 'Descobrir',
    title: 'Para encontrar histórias antes',
    body: 'Encontre histórias originais por gênero, formato e estilo. Descubra novos projetos antes que eles cheguem ao grande público.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        width={28}
        height={28}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    verb: 'Participar',
    title: 'Para reagir e comentar',
    body: 'Leia, comente, reaja e avalie. O retorno do público acontece dentro da própria história, no ponto em que ele faz sentido.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        width={28}
        height={28}
      >
        <path d="M4 6h12a4 4 0 014 4v2a4 4 0 01-4 4H10l-5 4v-4a4 4 0 01-1-2.7V10a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    verb: 'Decidir',
    title: 'Para transformar dados em argumento',
    body: 'Acompanhe leitura, engajamento, abandono e reação do público. Informações que ajudam a transformar percepção em evidência.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        width={28}
        height={28}
      >
        <path d="M4 20V8M10 20V4M16 20v-9M22 20H2" strokeLinecap="round" />
      </svg>
    ),
  },
]

export const NOT_A_LIST = [
  'Não é uma rede social.',
  'Não é um depósito de arquivos.',
  'Não é só para roteiristas.',
]
