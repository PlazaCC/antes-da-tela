---
title: "Corrigir tokens de cor e CSS vars para alinhar com Figma final"
type: frontend
priority: P0
branch: fix/design-token-corrections
clickup: https://app.clickup.com/t/86agyth5n
---

## Objetivo
Atualizar os CSS custom properties em `app/globals.css` e os tokens do `tailwind.config.ts` para que correspondam exatamente aos valores hex confirmados no Figma via Framelink MCP (figma.meta.json v4, gerado 2026-04-17). Toda a UI do app depende desses tokens — é a base de qualquer correção de design.

## Contexto
- Os hex values foram extraídos dos `globalVars` fills do arquivo Figma (`iUb8odefGSZiHz4KjuzX1M`)
- A versão anterior (design-system.meta.json v3) usava aproximações HSL manuais
- Fonte da verdade: `.agents/design-system.meta.json` → `foundations.colors.palette`
- Figma nodeId do arquivo: `iUb8odefGSZiHz4KjuzX1M` — acessar via `mcp__Framelink_Figma_MCP__get_figma_data` se precisar re-confirmar

## Mapa de correções (Figma hex → CSS var atual → novo valor HSL)

| Token | Hex Figma | CSS var atual | Novo valor |
|---|---|---|---|
| bg/base | #0E0E0E | hsl(0 0% 5%) | hsl(0 0% 5.5%) |
| bg/surface | #161616 | hsl(0 0% 9%) | hsl(0 0% 8.6%) |
| bg/elevated | #1E1E1E | hsl(0 0% 12%) | hsl(0 0% 11.8%) |
| border/subtle | #343434 | hsl(0 0% 14%) | hsl(0 0% 20.4%) |
| border/default | #252525 | hsl(0 0% 20%) | hsl(0 0% 14.5%) |
| text/primary | #F0EDE6 | hsl(42 25% 92%) | hsl(42 20% 92%) |
| text/secondary | #B7B4B0 | hsl(34 5% 70%) | hsl(40 3% 69%) |
| text/muted | #6B6860 | hsl(43 5% 40%) | hsl(36 4% 40%) |
| brand/accent | #E85C2F | hsl(15 80% 55%) | hsl(15 79% 55%) |
| brand/lime | #C8E87A | hsl(78 71% 69%) | hsl(78 71% 69%) ✓ |
| state/error | #EF4545 | hsl(0 84% 60%) | hsl(0 84% 60%) ✓ |
| state/success | #3CBF7E | hsl(150 52% 49%) | hsl(150 52% 49%) ✓ |

**Nota crítica**: `border/subtle` e `border/default` estavam **invertidos** na v3. O valor mais escuro (#252525 = 14.5%) é o `border/default` (bordas de cards/inputs). O mais claro (#343434 = 20.4%) é o `border/subtle`.

## Steps

1. Em `app/globals.css`, atualizar os CSS vars listados na tabela acima dentro do bloco `:root` (ou `.dark`).
2. Em `tailwind.config.ts`, garantir que os nomes de classe Tailwind mapeiam para os vars corretos.
3. Verificar `border-radius`: cards usam `8px` (confirmado Figma — `borderRadius: 8px` em todos os frames de tela), default = `2px`, pill = `9999px`.
4. Confirmar em `app/layout.tsx` que `next/font` carrega: `Inter` (sans-serif), `DM Serif Display` (display), `DM Mono` (monospace) e expõe as variáveis CSS corretas.
5. Abrir `/development/design-system` e validar visualmente que a paleta renderiza corretamente.
6. `yarn build` + `yarn lint` devem passar sem erros.

## Acceptance Criteria
- [x] CSS vars em `globals.css` correspondem aos hex values da tabela acima
- [x] `border/subtle` e `border/default` estão com os valores corretos (não invertidos)
- [x] Card borders são visivelmente `#252525` e não `#343434`
- [x] Fundo da app é `#0E0E0E`, header é `#161616`, accent é `#E85C2F`
- [x] `yarn build` e `yarn lint` passam

## Artifacts
- `app/globals.css` (CSS vars atualizados)
- `tailwind.config.ts` (tokens de cor)
- `app/layout.tsx` (confirmar next/font vars)
