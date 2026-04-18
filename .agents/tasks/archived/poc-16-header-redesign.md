---
title: "Redesenhar Header para alinhar com Figma 50:1747"
type: frontend
priority: P1
branch: fix/header-redesign
clickup: https://app.clickup.com/t/86agytuxz
figmaNodeId: "50:1747"
figmaScreen: "51:562 (Home — seção Header)"
---

## Objetivo
Refatorar `components/navbar.tsx` para que corresponda exatamente ao componente `Header` do Figma (nodeId `50:1747`), incluindo: barra de busca integrada no header, estados ativos de navegação, e layout fiel ao design final confirmado na seção `Fluxo principal` (186:1388).

## Contexto
- Figma: seção `Fluxo principal` nodeId `186:1388`, tela `Home` nodeId `51:562`
- Header Figma (50:1747): Logo à esquerda → Nav links no centro (gap 28px) → [Search input + Avatar + Publicar CTA] à direita
- Implementação atual em `components/navbar.tsx` tem Logo, links e AuthButton mas **sem** search input integrado e **sem** estado ativo nos links
- `components/navbar-search.tsx` existe separado mas não está integrado visualmente no header conforme Figma
- Buscar Figma via `mcp__Framelink_Figma_MCP__get_figma_data(fileKey="iUb8odefGSZiHz4KjuzX1M", nodeId="50:1747")` para layout specs exatos

## Layout do Header (confirmado Figma globalVars)
```
Header background: #161616 (bg/surface)
Border bottom: 1px solid #252525 (border/default)
Padding: 0px 16px (horizontal)
Height: fill (vertical)

Layout: row, justifyContent: space-between, alignItems: center, gap: 32px

Seções:
  - Logo (hug width)
  - Navigation items: row, gap: 28px (links Home / Roteiros)
  - User section: row, gap: 32px
    - Search container: Input w:352px h:32px
    - Avatar (w:28px h:28px circular)
    - Publicar button (CTA primário)
```

## Steps

1. Refatorar `components/navbar.tsx`:
   - Mover `navbar-search.tsx` para dentro do header como parte do `User section`
   - Usar `layout_IUJCX9`: row, space-between, align center, padding `0 16px`
   - Nav links com gap `28px`; user section com gap `32px`
   - Adicionar active state nos links: quando `pathname` bate com a rota, aplicar `text/primary` + sublinhado ou `brand/accent` conforme Figma
   
2. Active link state:
   - Usar `usePathname()` do `next/navigation`
   - Link ativo: `text-[color:var(--color-text-primary)] font-medium` ou borda inferior `brand/accent`
   - Verificar spec exato via Framelink MCP no nodeId `116:1184` (Navigation items)

3. Search input no header:
   - Width: `352px` (desktop), colapsar para ícone em `md:` breakpoint
   - Debounce 300ms, usa `useRouter + searchParams` para push `?q=` na home
   - Input estilo Figma: fundo `bg/elevated`, border `border/default`, placeholder `text/muted`

4. Mobile collapse:
   - Em `md:` e abaixo: ocultar nav links e search, mostrar ícone de hamburger ou busca
   - Manter Avatar e Publicar CTA visíveis em mobile

5. `yarn build` + `yarn lint` passam

## Acceptance Criteria
- [ ] Header tem Logo + Nav links (gap 28px) + Search input (352px) + Avatar + Publicar CTA
- [ ] Background do header é `#161616` com borda inferior `#252525`
- [ ] Link ativo tem estado visual diferenciado (Figma spec)
- [ ] Search input está dentro do header (não separado) e funciona com debounce 300ms
- [ ] Em 375px (mobile) o layout não quebra
- [ ] `yarn build` e `yarn lint` passam

## Artifacts
- `components/navbar.tsx` (refatorado)
- `components/navbar-search.tsx` (integrado ou removido se absorvido)
