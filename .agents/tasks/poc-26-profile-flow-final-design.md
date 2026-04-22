# poc-26 — Profile Flow: depar final + banner upload

**Scope:** Frontend  
**Priority:** P2  
**Status:** pending  
**Figma:** `186:1834` (Perfil), `186:1907` (Editar), `186:1963` (Dashboard)

---

## O que já está feito

### Perfil público (`/profile/[userId]`)
- Banner placeholder, Avatar sobrepondo banner ✓
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

### 1. ScriptCard sem cover (depar)

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

### 2. Banner image upload no Edit Profile

O Figma mostra um banner na tela de perfil. Atualmente o banner é um retângulo cinza fixo. Adicionar upload opcional do banner no Edit Profile.

**Arquivo:** `app/(authenticated)/profile/edit/page.tsx`

Na seção "Foto e identidade", adicionar abaixo do avatar:
- Label: "Imagem de banner (opcional)"
- Input file: aceita `image/*`, max 5MB
- Upload para bucket `covers` ou `avatars` (mesmo bucket das capas)
- Salvar path em `users.banner_path` (se existir) ou em campo separado

> **Nota:** Verificar se a tabela `users` tem `banner_path`. Se não, adicionar ao schema e gerar migration antes dessa feature.

**Arquivo:** `server/db/schema.ts` (se necessário)
- Adicionar `bannerPath: text('banner_path')` em `users`

**Arquivo:** `app/profile/[userId]/profile-client.tsx`
- Exibir banner como `<img src={bannerUrl} className="w-full h-[100px] object-cover" />` se disponível

### 3. Título da aba "Avaliações" — implementação básica

A aba "Avaliações" exibe "coming soon". Para POC: listar os roteiros avaliados pelo autor com estrelas e nota, consumindo `ratings.getUserRating` ou uma query existente.

> Isso é baixa prioridade — não bloqueia outras tasks. Fazer apenas se houver tempo.

### 4. Mobile — Dashboard e Edit Profile

O layout de sidebar + content não colapsa em mobile. Para POC, aceitar scroll horizontal ou converter a sidebar em tabs/menu hamburger simples.

---

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `server/db/schema.ts` | `bannerPath` em `users` (se não existir) |
| `app/(authenticated)/profile/edit/page.tsx` | Campo de upload de banner |
| `app/profile/[userId]/profile-client.tsx` | Exibir banner_url quando disponível; coverUrl em ScriptCards (após poc-21) |
| `server/api/users.ts` | `updateProfile` aceita `bannerPath` |

---

## Acceptance criteria

- [ ] Edit Profile: campo de upload de banner presente e funcional (aceita imagem, max 5MB)
- [ ] Perfil público: banner_url exibido quando disponível
- [ ] ScriptCards no perfil exibem cover (após poc-21)
- [ ] `yarn build` sem erros de tipo
