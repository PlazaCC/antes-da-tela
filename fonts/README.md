# Fonts

Coloque aqui os arquivos de fonte (`.woff2`, `.woff`, `.ttf`, etc.) para uso local no projeto.

## Como usar

1. Adicione o(s) arquivo(s) da fonte nesta pasta.
2. Registre a fonte em `app/layout.tsx` usando `next/font/local`:

```ts
import localFont from 'next/font/local'

const myFont = localFont({
  src: '../fonts/MyFont.woff2',
  variable: '--font-my',
  display: 'swap',
  weight: '400',
})
```

3. Anexe a variável ao `<body>` e, se quiser expor a família como utilitário Tailwind, adicione em `tailwind.config.ts`:

```ts
fontFamily: {
  my: ['var(--font-my)', 'sans-serif'],
},
```

> Prefira `.woff2` (menor e mais otimizado). Fontes locais não dependem de rede nem de Google Fonts.
