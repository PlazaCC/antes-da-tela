# [01] Design System — Tokens visuais, componentes e playground

> ClickUp: https://app.clickup.com/t/86agwj9wg
> Status: em progresso · Priority: urgent · Depends on: nenhuma

## Contexto

Branch `feat/design-system` já implementou os componentes e tokens. Esta task garante que o merge está correto, os tokens renderizam, e o playground valida o design system visualmente antes das demais features usarem os componentes.

**Arquivos-chave:**
- `tailwind.config.ts` — tokens de cor, tipografia, espaçamento, breakpoints
- `app/globals.css` — CSS custom properties (HSL channels, não hex)
- `app/layout.tsx` — fontes Google (Inter, DM Serif Display, DM Mono), ThemeProvider dark
- `components/ui/` — 18+ componentes
- `app/development/design-system/page.tsx` — showcase visual
- `app/development/components/page.tsx` — playground interativo
- `.agents/design-system.meta.json` — referência canônica de tokens do Figma

## Passos de execução

### 1. Merge da branch

```bash
git checkout main
git merge feat/design-system
```

### 2. Verificar tokens CSS (invariante crítica)

Abrir `app/globals.css`. Confirmar que **todas** as variáveis de design system usam HSL channels (não hex):

```css
/* CORRETO — hsl() channels sem a keyword */
--color-bg-base: 0 0% 5.5%;
--color-state-success: 153 51% 49%;

/* ERRADO — hex não funciona com hsl(var(...)) */
--color-bg-base: #0e0e0e;
```

Se encontrar hex, converter usando a tabela em `.agents/design-system.meta.json`.

### 3. Verificar chaves de cor no tailwind.config.ts

Confirmar que tokens de cor usam nested objects (não slash-keys):

```ts
// CORRETO
state: { success: 'hsl(var(--color-state-success))', error: '...', warning: '...' },
brand: { accent: 'hsl(var(--color-brand-accent))', lime: '...' },
surface: 'hsl(var(--color-bg-surface))',
elevated: 'hsl(var(--color-bg-elevated))',

// ERRADO — slash é interpretado como opacity modifier no Tailwind v3
'state/success': '...',
```

### 4. Verificar plugin do Tailwind

```ts
// tailwind.config.ts — topo do arquivo
import tailwindAnimate from 'tailwindcss-animate'
// ...
plugins: [tailwindAnimate],  // não () => import(...)
```

### 5. Verificar MetricCard usa tokens de design system

```ts
// components/ui/metric-card.tsx — CORRETO
positive: 'border-state-success/20 bg-state-success/10 text-state-success',
negative: 'border-state-error/20 bg-state-error/10 text-state-error',

// ERRADO
positive: 'border-green-500/20 bg-green-500/10 text-green-100',
```

### 6. Verificar metadata da app

```ts
// app/layout.tsx
title: 'Antes da Tela',
description: 'Plataforma de publicação, leitura e discussão de roteiros audiovisuais.',

// app/development/layout.tsx
title: 'Development | Antes da Tela',
```

## Validação

```bash
yarn build    # deve passar sem erros
yarn lint     # deve passar sem warnings
```

**Verificação visual (yarn dev):**
- [ ] `http://localhost:3000/development/design-system` — paleta de cores renderiza com as cores corretas do dark mode
- [ ] `http://localhost:3000/development/components` — todos os componentes listados e interativos
- [ ] Tag variant `success` → verde, `warning` → amarelo, `error` → vermelho (cores do design system, não raw Tailwind)
- [ ] MetricCard `color="positive"` → borda/bg verde; `color="negative"` → borda/bg vermelho
- [ ] Fonte serif visível nos headings (DM Serif Display)
- [ ] Fonte mono visível em elementos `code` (DM Mono)

## Checklist de aceite

- [ ] `yarn build` e `yarn lint` passam sem erros
- [ ] Tokens renderizam corretamente em `/development/design-system`
- [ ] Nenhum componente usa cores raw Tailwind (`green-500`, `red-500`) onde deveria usar tokens
- [ ] `app/layout.tsx` com título "Antes da Tela" (não o starter kit padrão)
- [ ] Branch `feat/design-system` merged em `main`
