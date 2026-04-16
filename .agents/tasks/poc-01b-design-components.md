# [01b] Componentização — Implementação de componentes faltantes

> Status: pending · Priority: high · Depends on: poc-01a

## Objetivo

Implementar os componentes faltantes ou incompletos identificados no audit: `ScriptCard`, `NavBar`, `ReactionBar`, `Tag` (semantic variants), `StarRating` (interatividade), `MetricCard`.

> Nota: assets gráficos (SVG) e telas (PNG/PDF) foram adicionados manualmente em `.agents/figma/components/` e `.agents/figma/screens/`. Esses arquivos já foram registrados em `.agents/design-system.meta.json` e podem ser usados como referência visual durante a implementação.

## Passos

1. Reusar primitives existentes em `components/ui/` sempre que possível (Button, Input, Card).
2. Implementar `ScriptCard` com estados `default` e `hover` e metadados (author, pages, rating).
3. Implementar `NavBar` com versão desktop e versão mobile (collapse) e mapas de rota ativos.
4. Implementar `ReactionBar` com botões acessíveis e ARIA labels.
5. Estender `Tag` para suportar semantic variants (success, warning, error, draft, published).
6. Implementar `StarRating` interativo com partial-star support e validação via `trpc` quando aplicável.
7. Adicionar exemplos e playground em `app/development/components/page.tsx`.

## Acceptance

- [ ] `ScriptCard` implementado e responsivo (mobile -> 1 coluna; desktop -> 3 colunas)
- [ ] `NavBar` desktop + mobile collapse funcionando e estilizado com tokens
- [ ] `ReactionBar` acessível (keyboard + screen reader)
- [ ] `Tag` tem variantes semânticas e usa tokens de cor
- [ ] `StarRating` atualiza estado sem reload e aceita meia-estrelas
- [ ] Exemplos adicionados ao playground `app/development/components/page.tsx`
- [x] Assets gráficos (SVG/PNG/PDF) estão presentes em `.agents/figma/` e registrados em `.agents/design-system.meta.json`.

## Files a tocar

- `components/ui/script-card.tsx`
- `components/ui/nav-bar.tsx`
- `components/ui/reaction-bar.tsx`
- `components/ui/tag.tsx`
- `components/ui/star-rating.tsx`
- `app/development/components/page.tsx`
