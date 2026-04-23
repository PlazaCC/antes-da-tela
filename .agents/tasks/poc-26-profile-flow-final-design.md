# poc-26 — Dashboard: Edição e Exclusão de Roteiros + Profile Flow

**Scope:** Frontend / Backend (tRPC)
**Priority:** P0 (Prioridade 1)
**Status:** pending
**Figma:** `186:1834` (Perfil), `186:1907` (Editar), `186:1963` (Dashboard)

---

## O que já está feito

### Perfil público (`/profile/[userId]`)
13: - Banner placeholder (mockado visual), Avatar sobrepondo banner ✓
- Nome, handle derivado do nome, bio ✓
- Stats: roteiros, seguidores, seguindo, avaliação média ✓
- FollowButton (não aparece no próprio perfil) ✓
- Tabs: Roteiros | Avaliações | Atividade ✓
- Grid de ScriptCards 4 colunas ✓

### Editar Perfil (`/profile/edit`)
- Sidebar de navegação com 5 seções ✓
- Seção "Foto e identidade": Avatar upload funcional ✓
- Seção "Dados pessoais": nome + bio ✓
- Form com validação Zod + toast de feedback ✓

### Dashboard (`/dashboard`)
- Sidebar de navegação ✓
- MetricCards (roteiros, avaliação, comentários, leituras) ✓
- Tabela de performance por roteiro ✓

---

## Gaps

35: ### 1. Edição e Exclusão de Roteiros e Capas (P0 - PRÓXIMA TASK)

Atualmente a tabela no Dashboard lista os roteiros, mas não permite editá-los ou excluí-los. O autor precisa de controle total sobre o que publicou.

**O que fazer:**
- Adicionar uma coluna de "Ações" (usando um DropdownMenu com ícone `MoreVertical` ou similar) em cada linha da tabela de performance.
- **Ação 1: Editar:** Redireciona para o fluxo de edição (ex: `/publish?id=...` ou rota dedicada `/scripts/[id]/edit`). Permite alterar título, logline, sinopse, tags e reenviar PDF.
- **Ação 2: Excluir:** Abre um `AlertDialog` de confirmação ("Tem certeza? Ação irreversível."). Ao confirmar, chama mutation tRPC (`scripts.delete`), invalida a query do dashboard e exibe toast de sucesso.
43: - **Backend:** Criar a mutation `delete` no router `scripts`, garantindo via auth que só o autor pode excluir. Configurar também a edição de roteiros existentes (título, metadados e capa).
44: - **Edição de Capa:** No fluxo de edição, incluir o campo de upload de capa do roteiro (2:3).

**Arquivos principais:**
- `app/(authenticated)/dashboard/page.tsx`
- `server/api/scripts.ts`
- Novo formulário/rota de edição de roteiro.

### 2. ScriptCard sem cover (depar)

Os ScriptCards na grid do perfil não têm `coverUrl`. Isso é resolvido pelo poc-21 (adiciona `cover_path` ao schema + prop no ScriptCard). Após poc-21, passar `coverUrl` também nos ScriptCards do perfil.

**Arquivo:** `app/profile/[userId]/profile-client.tsx`
```tsx
// Após poc-21 adicionar cover_path ao listByAuthor:
<ScriptCard
  key={script.id}
  href={`/scripts/${script.id}`}
  coverUrl={script.cover_url}  // adicionar quando poc-21 estiver feito
  ...
/>
```


83: - Exibir banner mockado fixo (visual apenas)

### 4. Título da aba "Avaliações" — implementação básica

A aba "Avaliações" exibe "coming soon". Para POC: listar os roteiros avaliados pelo autor com estrelas e nota, consumindo `ratings.getUserRating` ou uma query existente.

> Isso é baixa prioridade — não bloqueia outras tasks. Fazer apenas se houver tempo.

### 5. Mobile — Dashboard e Edit Profile

O layout de sidebar + content não colapsa em mobile. Para POC, aceitar scroll horizontal ou converter a sidebar em tabs/menu hamburger simples.

---

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `app/(authenticated)/dashboard/page.tsx` | Dropdown de ações (Editar/Excluir) na tabela |
| `server/api/scripts.ts` | Mutations de `delete` e edição de roteiros |
| `app/profile/[userId]/profile-client.tsx` | Exibir banner_url quando disponível; coverUrl em ScriptCards (após poc-21) |
106: | `server/api/users.ts` | `updateProfile` (mantendo apenas avatar/nome/bio) |

---

## Acceptance criteria

- [ ] Dashboard: Dropdown de ações na tabela implementado
- [ ] Ação de Excluir roteiro funcional (tRPC mutation, AlertDialog, verificação de autorização)
- [ ] Ação de Editar roteiro funcional (permite alterar metadados e PDF)
116: - [ ] Perfil público: banner exibido como elemento visual (mockado)
- [ ] ScriptCards no perfil exibem cover (após poc-21)
- [ ] `yarn build` sem erros de tipo
