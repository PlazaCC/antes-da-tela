---
title: "Implementar páginas de perfil — Perfil, Editar e Dashboard do Autor"
type: frontend
priority: P1
branch: feat/profile-pages
clickup: https://app.clickup.com/t/86agytvxw
figmaNodeIds:
  PerfilUsuario: "186:1834"
  EditarPerfil: "186:1907"
  DashboardAutor: "186:1963"
figmaSection: "Perfil do usuário (186:2075)"
dependsOn: ["poc-17-avatar-followbutton-components"]
---

## Objetivo
Implementar as três telas de perfil definidas na seção `Perfil do usuário` do Figma: perfil público do roteirista, formulário de edição de perfil e dashboard de métricas do autor.

## Contexto
- Figma: seção `Perfil do usuário` nodeId `186:2075`
  - `S06/Perfil-Usuario` → nodeId `186:1834` → rota `/profile/[username]`
  - `S07/Editar-Perfil` → nodeId `186:1907` → rota `/profile/edit`
  - `S09/Dashboard-Autor` → nodeId `186:1963` → rota `/dashboard`
- Buscar specs: `mcp__Framelink_Figma_MCP__get_figma_data(fileKey="iUb8odefGSZiHz4KjuzX1M", nodeId="186:2075")`
- Componentes necessários: `Header` (poc-16), `Avatar` (poc-17), `FollowButton` (poc-17), `ScriptCard` (48:644), `Tag`, `RatingBox`, `MetricCard` (13:145)
- Tabela `users` tem: `id`, `name`, `email`, `image` (avatar URL), `bio` (verificar se existe ou adicionar migration)
- Task existente no board: `[Perfil] - 86agq8zbq` (pendente)

## Telas a implementar

### S06 — Perfil Público (`/profile/[username]`)
- Acesso público (sem login)
- Layout: Header + hero do autor (Avatar lg + Nome + Bio + FollowButton) + grid de roteiros publicados
- tRPC: `users.getPublicProfile(username)` → `{ user, scripts[] }`
- SSR: prefetch no Server Component via `HydrateClient`
- Componentes: `Avatar` (lg), `FollowButton`, `ScriptCard` (grid), `Tag`, `RatingBox`

### S07 — Editar Perfil (`/profile/edit`)
- Rota protegida (autenticado)
- Formulário: nome, bio (textarea), upload de avatar → Supabase Storage bucket `avatars`
- React Hook Form + Zod validation
- tRPC: `users.updateProfile({ name, bio, avatarUrl })` (mutation)
- Upload avatar: client-side direto ao bucket `avatars`, path `{userId}/avatar_{timestamp}.{ext}`
- Componentes: `Header`, `Avatar` (preview ao vivo), `Input`, `Button`

### S09 — Dashboard do Autor (`/dashboard`)
- Rota protegida
- Métricas: total de leituras, comentários, avaliações médias por roteiro
- Grid de roteiros do autor com ações (editar/despublicar)
- tRPC: `scripts.getDashboardMetrics()` → `{ totalReads, totalComments, avgRating, scripts[] }`
- Componentes: `Header`, `Avatar`, `MetricCard` (13:145), `ScriptCard`, `Tag`

## Steps

1. Criar `app/profile/[username]/page.tsx` (Server Component, público):
   - `generateMetadata` com nome do autor
   - Prefetch `users.getPublicProfile`
   - Renderizar `ProfilePageClient`

2. Criar `components/profile-page/profile-page-client.tsx`:
   - Hero: Avatar lg + nome + bio + FollowButton
   - Grid de ScriptCards

3. Criar `app/profile/edit/page.tsx` (protegida, redirecionar se não autenticado):
   - Formulário com React Hook Form
   - Avatar upload via `supabase.storage.from('avatars').upload()`
   - tRPC mutation `users.updateProfile`

4. Criar `app/dashboard/page.tsx` (protegida):
   - MetricCards: Leituras / Comentários / Avaliação média
   - Lista de roteiros do autor com status

5. **MetricCard (13:145)**:
   - Criar `components/metric-card/metric-card.tsx`
   - Props: `title`, `value`, `variation?: number`, `variant: 'positive' | 'negative' | 'neutral'`
   - Buscar spec via Framelink: `nodeId="13:145"`

6. tRPC endpoints necessários:
   - `users.getPublicProfile(username)` (public)
   - `users.updateProfile({ name, bio, avatarUrl? })` (authenticated)
   - `scripts.getDashboardMetrics()` (authenticated)
   - Verificar se `users.follow` / `users.unfollow` do poc-17 está disponível

7. Schema DB: verificar se `users` tem coluna `bio` e `username`. Se não, criar migration Drizzle.

## Acceptance Criteria
- [x] `/profile/[username]` carrega sem login e exibe roteiros do autor em SSR
- [x] FollowButton funciona na página de perfil
- [x] `/profile/edit` atualiza nome, bio e avatar; avatar aparece no Header após update
- [x] `/dashboard` exibe MetricCards com dados reais de leituras/comentários/avaliação
- [x] MetricCard positive usa `state/success`, negative usa `state/error`
- [x] `yarn build` e `yarn lint` passam

## Artifacts
- `app/profile/[username]/page.tsx`
- `app/profile/edit/page.tsx`
- `app/dashboard/page.tsx`
- `components/profile-page/profile-page-client.tsx`
- `components/metric-card/metric-card.tsx` + `index.ts`
- `server/api/users.ts` (getPublicProfile, updateProfile)
- `server/api/scripts.ts` (getDashboardMetrics)
- Migration Drizzle se `bio`/`username` faltantes
