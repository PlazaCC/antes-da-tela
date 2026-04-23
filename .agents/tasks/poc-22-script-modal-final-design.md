# poc-22 — Script Preview Modal: design final

**Scope:** Frontend
**Priority:** P1
**Status:** pending
**Figma:** Modal/Roteiro `51:718`
**Depends on:** poc-21 (precisa de `cover_path` no schema)

---

## O que já está feito

- Layout dois painéis (sidebar + main content) ✓
- CloseButton, título DM Serif Display ✓
- AuthorSection com Avatar + FollowButton ✓
- Tags (gênero, age rating) ✓
- StatsSection com RatingInfo e distribuição ✓
- Logline e sinopse ✓
- Botão "Ler Roteiro" mobile ✓

---

## Gaps

### 1. Cover image no sidebar do modal

`ModalSidebar` não exibe imagem de capa. O script agora terá `cover_path` (poc-21).

**Arquivo:** `components/script-preview-modal/sidebar.tsx`

- Adicionar prop `coverUrl?: string | null`
- No topo do sidebar: bloco `aspect-[4/5]` com cover image ou placeholder cinza
- Se `coverUrl` null: retângulo bg `bg-elevated` com label "Thumbnail 2:3" em text-muted

### 2. Audio player no sidebar do modal

O audio player existe no leitor (`script-page-client.tsx`) mas **não aparece no modal**. O Figma mostra o player dentro do sidebar abaixo da cover.

**Arquivo:** `components/script-preview-modal/sidebar.tsx`

- Adicionar `audioUrl?: string | null` como prop
- Abaixo do cover: renderizar `<AudioPlayer src={audioUrl} />` se `audioUrl` presente
- Se não tiver áudio, omitir o bloco

### 3. Passar `coverUrl` e `audioUrl` ao modal

`ScriptPreviewModal` busca o script via `scripts.getById`. Verificar se o endpoint retorna `cover_path` e `audio_files[0].storage_path`.

**Arquivo:** `server/api/scripts.ts`

- Garantir que `getById` inclui `cover_path` e `audio_files(storage_path)` no select
- No client: resolver URL pública do Storage para `cover_path` e `audio_files[0].storage_path` antes de passar como props

> **Atenção (convenção):** URLs do Storage devem ser resolvidas server-side via `supabase.storage.from(bucket).getPublicUrl(path)`. Como o modal é client-side, o endpoint tRPC deve retornar a URL pública já resolvida, não o path bruto.

---

## Arquivos a modificar

| Arquivo                                                    | Mudança                                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| `server/api/scripts.ts`                                    | `getById` retorna `cover_url` e `audio_url` (URLs públicas já resolvidas) |
| `components/script-preview-modal/sidebar.tsx`              | Cover placeholder + AudioPlayer se `audioUrl` presente                    |
| `components/script-preview-modal/script-preview-modal.tsx` | Passar `coverUrl` e `audioUrl` para `ModalSidebar`                        |

---

## Acceptance criteria

- [ ] Modal exibe cover placeholder 2:3 no sidebar; se script tem capa mostra a imagem
- [ ] Modal exibe AudioPlayer no sidebar se script tem áudio; oculto se não tem
- [ ] `getById` retorna URLs públicas (não paths brutos do Storage)
- [ ] Layout dois painéis mantido em ≥ 768px; painel único empilhado em < 768px
- [ ] `yarn build` sem erros de tipo
