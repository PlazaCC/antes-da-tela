/**
 * Conteúdo da página /embaixadores. Fonte: docs/embaixadores/README.md
 * (pendências de aprovação, fotos e links ficam registradas lá).
 */

export interface Ambassador {
  slug: string
  name: string
  role: string
  /** Frase curta do card. */
  tagline: string
  /** Bio média, exibida no painel lateral. */
  bio: string
  /** Dois primeiros aparecem no card; todos aparecem no painel. */
  highlights: string[]
  projects?: string[]
  links: { label: string; href: string }[]
  photo: string
}

export interface Testimonial {
  author: string
  company: string
  quote: string
}

export interface Supporter {
  name: string
  fullName: string
  href: string
  /** Sem logo, o nome aparece no lugar. */
  logo?: { src: string; width: number; height: number }
}

export const AMBASSADORS: Ambassador[] = [
  {
    slug: 'fabiano-liporoni',
    name: 'Fabiano Liporoni',
    role: 'Fundador · Já Viu?',
    tagline:
      'Cineasta e pesquisador, criador do Já Viu?, com mais de 60 mil seguidores e listas de melhores do ano há mais de 20 anos.',
    bio: 'Formado em Cinema pela Université Lumière de Lyon, Fabiano é pesquisador da UFSCar em Produção de Conteúdo Multiplataforma. Dirigiu e roteirizou Benzadeus, curta documentário exibido em 18 festivais internacionais e premiado em Austin e New Jersey. À frente do Já Viu?, criou o #1filmepordia e as hashtags #alertafilmão e #alertaporcaria.',
    highlights: [
      'Benzadeus · 18 festivais',
      'UFSCar',
      'Melhor Curta Documentário Internacional no Austin International Art Festival e no New Jersey International Short Festival',
      'Já Viu?: 60 mil+ inscritos entre YouTube, TikTok, Instagram, podcast e blog',
    ],
    projects: ['Cafuné (Em Cabeça Decepada), longa em captação', 'Gente de Quem?, documentário em pós-produção'],
    links: [{ label: 'javiu.blog', href: 'https://javiu.blog' }],
    photo: '/embaixadores/fabiano-liporoni.jpg',
  },
  {
    slug: 'pedro-de-barros',
    name: 'Pedro de Barros',
    role: 'Realizador · Professor',
    tagline:
      'Realizador e roteirista há quase 20 anos, já ensinou roteiro a mais de 10 mil alunos e hoje filma a Amazônia a partir de Alter do Chão.',
    bio: 'Formado em Audiovisual pela ECA-USP, com mestrado na Universidade do Algarve e pós em Desenvolvimento de Projeto Cinematográfico na ESTC, em Lisboa, Pedro dirigiu filmes para Netflix, Greenpeace e WWF e oito curtas autorais, entre eles o premiado Popókas. Desde 2022 vive em Alter do Chão (PA), onde desenvolve projetos sobre cultura, território e as disputas da Amazônia.',
    highlights: [
      'Netflix · Greenpeace · WWF',
      '10 mil+ alunos',
      'Curso de Roteiro na Udemy e Quimera na Vídeo PRO',
      'Curtas Popókas, O Gosto do Cigarro e Boto Sereia',
    ],
    projects: [
      '11 Sinais, primeiro longa, contemplado pela Lei Paulo Gustavo',
      '33 Dias, documentário sobre a ocupação do terminal da Cargill em Santarém por povos do Tapajós',
      'Raízes do Chão, documentário sobre gentrificação em Alter do Chão',
      'Égua da Visagem, teatro de sombras com lendas amazônicas',
    ],
    links: [],
    photo: '/embaixadores/pedro-de-barros.jpg',
  },
  {
    slug: 'luca-paiva-mello',
    name: 'Luca Paiva Mello',
    role: 'Fundador · Scriptonita Films',
    tagline:
      'Roteirista e produtor duas vezes indicado ao Emmy Internacional, criador da primeira sitcom infantil brasileira, Bugados.',
    bio: 'Duas vezes indicado ao Emmy Internacional, Luca é roteirista e produtor de sucessos como Bugados, Julie e os Fantasmas, Descolados e O Negócio. Já desenvolveu mais de 400 episódios de ficção e adaptou para o cinema obras de Pedro Bandeira e Camilo Castelo Branco, como A Droga da Obediência e Memórias do Cárcere.',
    highlights: [
      '2× Emmy Internacional',
      '400+ episódios',
      'Criador de Bugados, primeira sitcom infantil brasileira',
      'Julie e os Fantasmas, Descolados, O Negócio',
    ],
    projects: ['Necromorfus, adaptação dos quadrinhos de Gabriel Arrais para o mercado internacional', 'Gatilhos, longa-metragem'],
    links: [],
    photo: '/embaixadores/luca-paiva-mello.jpg',
  },
  {
    slug: 'camila-luppi',
    name: 'Camila Luppi',
    role: 'Desenvolvimento · TV e streaming',
    tagline:
      'Quase 10 anos entre FOX e Disney, supervisionou a criação das produções originais da National Geographic no Brasil.',
    bio: 'Especialista em desenvolvimento de projetos para TV e streaming, Camila atuou por quase 10 anos na FOX e na Disney. Supervisionou criativamente as produções originais da National Geographic no Brasil, da curadoria e prospecção de conteúdos à avaliação de novos projetos e ao acompanhamento de séries em desenvolvimento e produção. Formada em Audiovisual pela ECA-USP.',
    highlights: [
      'National Geographic',
      'FOX · Disney',
      'Editora de vídeo no Digital da FOX',
      'Curadoria de conteúdo e assistência de direção',
    ],
    links: [],
    photo: '/embaixadores/camila-luppi.jpg',
  },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    author: 'Zico Goes',
    company: 'Produtor Criativo, Kromaki Filmes',
    quote:
      'Antes da Tela tem um quê de Tinder ao aproximar criadores de agentes do mercado. Mas, em essência, é um lugar de encontros e colaboração. Muito bem sacado! Deu match!',
  },
  {
    author: 'Victor Lemos',
    company: 'Galo Bravo',
    quote:
      'O Antes da Tela vem para dar voz a novos autores e roteiristas, ao mesmo tempo que permite aos players alcançar um patamar de diversidade de temas e histórias nunca antes visto no Brasil.',
  },
  {
    author: 'Nelson Sato',
    company: 'Sato Company',
    quote:
      'Excelente iniciativa e formato! Apoio e acredito que será uma interessante forma de organizar e expandir o mercado como um todo. Parabéns!',
  },
  {
    author: 'Luca Paiva Mello',
    company: 'Scriptonita Films',
    quote:
      'Um lugar para descobrir novas narrativas e se conectar com histórias, personagens e outros amantes de filmes e séries. No Antes da Tela, você pode ser o curador do próximo sucesso do cinema ou do streaming.',
  },
]

export const SUPPORTERS: Supporter[] = [
  {
    name: 'ABRA',
    fullName: 'Associação Brasileira de Autores Roteiristas',
    href: 'https://www.abra.art.br/',
    logo: { src: '/embaixadores/abra.png', width: 133, height: 72 },
  },
  {
    name: 'FRAPA',
    fullName: 'Festival de Roteiro Audiovisual de Porto Alegre',
    href: 'https://frapa.art.br/',
    logo: { src: '/embaixadores/frapa.png', width: 160, height: 63 },
  },
]
