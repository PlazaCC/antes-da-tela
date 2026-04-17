---
title: "Extrair Avatar standalone e implementar FollowButton"
type: frontend
priority: P1
branch: feat/avatar-followbutton
clickup: https://app.clickup.com/t/86agytv5h
figmaNodeIds:
  Avatar: "38:115"
  FollowButton: "38:119"
---

## Objetivo
Criar `Avatar` como componente standalone reutilizável (atualmente inline em vários lugares) e implementar `FollowButton` (toggle follow/unfollow para autores) — ambos são componentes críticos usados em Home, Modal/Roteiro, Perfil e PDF Reader.

## Contexto
- **Avatar (38:115)**: avatar circular com imagem ou fallback de iniciais. Atualmente implementado inline em `comments-sidebar.tsx` (`w-8 h-8 bg-brand-accent/20`). Precisa ser extraído para `components/avatar/avatar.tsx`.
- **FollowButton (38:119)**: componente novo, completamente ausente. Aparece em: Home (cards de autor), Modal/Roteiro (sidebar do autor), Perfil-Usuario. Tem duas variantes: `default` (Property 1=Default) e `expanded` (Property 1=Expanded).
- Buscar specs exatos via `mcp__Framelink_Figma_MCP__get_figma_data(fileKey="iUb8odefGSZiHz4KjuzX1M", nodeId="38:115")` e `nodeId="38:119"`.
- `Avatar` será dependência de todos os tasks subsequentes (poc-18, poc-19, perfil, header).

## Avatar — Spec Figma (38:115)
```
Dimensões: w:28px h:28px (no Header), w:32px h:32px (em comments)
Shape: circle (border-radius 9999px)
Fallback: iniciais em bg brand-accent/20, text brand/accent
Com imagem: object-cover, circular crop
Props: src?, name, size (sm=28 | md=32 | lg=48)
```

## FollowButton — Spec Figma (38:119)
```
Variantes:
  - default: "Seguir" — outline button, border brand/accent, text brand/accent
  - following: "Seguindo" — filled button, bg brand/accent, text white (ou invertido)
Transição de estado ao clicar
Requer auth: se não autenticado, redirecionar para login
```

## Steps

### Avatar
1. Criar `components/avatar/avatar.tsx`:
   ```tsx
   // Props: src?: string, name: string, size?: 'sm' | 'md' | 'lg'
   // sm = 28px, md = 32px, lg = 48px
   // Com src: <img> circular com object-cover
   // Sem src: div circular com iniciais (name[0] + surname[0]) uppercase
   // Background fallback: bg-brand-accent/20, text brand/accent
   ```
2. Criar `components/avatar/index.ts` re-exportando.
3. Substituir todas as implementações inline de avatar por `<Avatar />`:
   - `components/pdf-viewer/comments-sidebar.tsx`
   - `components/navbar.tsx` (user menu)
   - `components/script-preview-modal/script-preview-modal.tsx`

### FollowButton
1. Criar `components/follow-button/follow-button.tsx`:
   - Props: `authorId: string`, `initialFollowing?: boolean`
   - Estado local `following` com `useState`
   - tRPC mutation `users.follow(authorId)` / `users.unfollow(authorId)` (criar os endpoints se ainda não existirem)
   - Se não autenticado: redirecionar para `/login` ao clicar
   - Variante visual: border outline quando `following=false`, filled quando `following=true`
2. Criar `components/follow-button/index.ts`.
3. Adicionar `follow` e `unfollow` ao `usersRouter` (ou criar `followsRouter`) em `server/api/` se necessário — upsert/delete na tabela `user_follows` (verificar se existe no schema ou criar migration).

## Acceptance Criteria
- [x] `<Avatar src={...} name="João Silva" size="md" />` renderiza imagem circular; sem `src` mostra "JS" em bg brand-accent/20
- [x] Avatar substituído em todos os usos inline existentes
- [x] `<FollowButton authorId={...} />` renderiza botão "Seguir" e ao clicar muda para "Seguindo" (com toggle visual)
- [x] Usuário não autenticado clicando FollowButton é redirecionado para login
- [x] `yarn build` e `yarn lint` passam

## Artifacts
- `components/avatar/avatar.tsx` + `index.ts`
- `components/follow-button/follow-button.tsx` + `index.ts`
- `server/api/users.ts` (follow/unfollow procedures, se necessário)
- Arquivos atualizados: `comments-sidebar.tsx`, `navbar.tsx`, `script-preview-modal.tsx`
