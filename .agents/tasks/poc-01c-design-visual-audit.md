# [01c] Visual QA — Ajustes responsivos e QA 1:1

> Status: pending · Priority: normal · Depends on: poc-01b

## Objetivo

Executar QA visual 1:1 contra os screenshots Figma exportados, documentar discrepâncias visuais e aplicar correções de espaçamento, tipografia e tokens. Validar acessibilidade básica (contraste) e áreas de toque.

## Passos

1. Coletar screenshots em `.agents/figma/screens/` e organizar por rota/componente.
2. Comparar visualmente cada componente chave (Button, Tag, ScriptCard, NavBar, Comment, StarRating) e documentar diferenças em um checklist.
3. Ajustar estilos usando tokens (evitar hardcoded px) e re-testar em 375px / 768px / 1280px.
4. Rodar checks de contraste e garantir botão/elemento interativo mínimo 44px por direção.

## Acceptance

- [x] Checklist visual preenchido com screenshots antes/depois para cada componente crítico
- [x] Correções aplicadas via tokens (nenhum ajuste visual feito com valores hardcoded sem justificativa)
- [x] Breakpoints verificados: 375px, 768px, 1280px
- [x] Contraste mínimo e áreas de toque atendem guidelines

## Files a tocar

- `app/development/design-system/page.tsx`
- `app/development/components/page.tsx`
- `components/ui/*`
