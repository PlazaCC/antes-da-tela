---
title: "Revisão de design do ScriptPreviewModal — FollowButton e RatingInfo"
type: frontend
priority: P1
branch: fix/scriptmodal-design-revision
clickup: https://app.clickup.com/t/86agytvm3
figmaNodeId: "51:718"
figmaSection: "Fluxo principal (186:1388)"
dependsOn: ["poc-17-avatar-followbutton-components"]
---

## Objetivo
Alinhar `ScriptPreviewModal` com o design final do Figma `Modal/Roteiro` (nodeId `51:718`): adicionar `FollowButton` na seção do autor, `RatingInfo` com breakdown de avaliações, e corrigir o layout geral para fidelidade ao wireframe de alta fidelidade.

## Contexto
- Implementado em `components/script-preview-modal/script-preview-modal.tsx`
- Figma frame: `Modal/Roteiro` nodeId `51:718`, seção `Fluxo principal` (186:1388)
- Buscar spec via `mcp__Framelink_Figma_MCP__get_figma_data(fileKey="iUb8odefGSZiHz4KjuzX1M", nodeId="51:718")`
- Componentes já implementados neste modal: Dialog, StarRating, Tag, Skeleton, Button "Ler roteiro"
- Componentes faltantes confirmados via Figma: `FollowButton` (38:119), `RatingInfo` (48:920), `Avatar` (38:115) standalone
- `FollowButton` e `Avatar` serão entregues por `poc-17`

## Componentes faltantes no Modal (confirmados via Figma)

### Seção autor (identificada via componentId na tela 51:718)
- `Avatar` do autor (38:115) — atualmente inline/placeholder
- `FollowButton` (38:119) — ao lado do nome do autor, completamente ausente
- Layout: Avatar + Nome + FollowButton em linha horizontal

### Seção avaliações
- `RatingInfo` (48:920) — breakdown das avaliações (distribuição por estrela)
- Atualmente só tem média numérica, sem breakdown

### ScriptCard (48:644)
- `figmaNodeId` nos metadados estava errado (era `3:51`) — agora corrigido para `48:644`
- Verificar se algum componente usa o nodeId antigo e corrigir referências

## Steps

1. **Seção do autor no modal**:
   - Substituir avatar inline por `<Avatar>` do poc-17
   - Adicionar `<FollowButton authorId={script.author_id} />` ao lado do nome do autor
   - Layout: `flex items-center gap-3` com Avatar (md), nome+bio em coluna, FollowButton à direita

2. **RatingInfo (48:920)**:
   - Criar `components/rating-info/rating-info.tsx`
   - Buscar spec via Framelink: `nodeId="48:920"`
   - Props: `ratings: { stars: number, count: number }[]`, `average: number`, `total: number`
   - Exibir barra de distribuição por estrela (1★ a 5★) com percentual
   - Usar dados de `trpc.ratings.getDistribution(scriptId)` (criar endpoint se não existir)

3. **Layout geral do modal**:
   - Verificar e corrigir padding, gap e tipografia conforme Figma nodeId `51:718`
   - Título: `Heading/2` (DM Serif Display 32px)
   - Logline: blockquote com border-left `brand/accent`
   - Labels "LOGLINE" / "SINOPSE": `Label/Mono-Caps` (DM Mono 11px uppercase)
   - Tags de gênero e classificação etária em linha horizontal

4. **Correção de referência ScriptCard**:
   - Buscar qualquer referência a `figmaNodeId: "3:51"` no codebase e atualizar para `"48:644"`

5. `yarn build` + `yarn lint` passam

## Acceptance Criteria
- [x] Modal/Roteiro abre e exibe Avatar + nome do autor + FollowButton na mesma linha
- [x] FollowButton funciona (toggle seguir/seguindo)
- [x] RatingInfo stat cards visíveis (Avaliações, Nota média, Comentários)
- [x] Tipografia e espaçamento batem com Figma nodeId `51:718`
- [x] `yarn build` e `yarn lint` passam

## Artifacts
- `components/script-preview-modal/script-preview-modal.tsx` (atualizado)
- `components/rating-info/rating-info.tsx` + `index.ts` (novo)
- `server/api/ratings.ts` (getDistribution, se necessário)
