# poc-25 — Upload Wizard: imagens de capa e banner

**Scope:** Frontend + Backend  
**Priority:** P0 — bloqueante para poc-21 e poc-22  
**Status:** pending

---

## O que já está feito

- 4 steps completos: Informações, Arquivos (PDF + áudio), Categorização, Revisão ✓
- Progress indicator estilizado ✓
- Upload client-side de PDF (max 50 MB) e áudio (max 100 MB) ✓
- tRPC `scripts.create` funcional ✓

---

## Gaps críticos

### 1. Schema — coluna `cover_path` em `scripts`

A tabela `scripts` já tem `banner_path` mas **não tem `cover_path`**. Ambos são necessários:

| Campo | Uso | Onde aparece |
|---|---|---|
| `cover_path` | Capa do roteiro (proporção 2:3) | ScriptCard, Modal, Em Alta na Home |
| `banner_path` | Banner da home/destaque (proporção 16:9 ou livre) | Seção "Em Alta" futuramente |

**Ação:**
1. `server/db/schema.ts`: adicionar `coverPath: text('cover_path')` em `scripts` (após `bannerPath`)
2. `yarn drizzle-kit generate`
3. `npx supabase@latest db query --linked --file ./drizzle/<migration>.sql`

### 2. FileStep — upload de capa e banner

Adicionar dois novos campos de upload opcionais no Step 2 (`components/publish/file-step.tsx`):

**Capa do roteiro (opcional):**
- Aceita: `image/jpeg`, `image/png`, `image/webp`
- Max: 5 MB
- Bucket: `avatars` (reutilizar) ou criar bucket `covers` — verificar qual existe
- Proporção recomendada: 2:3 (indicar no label)
- Preview: `<img>` com `object-cover aspect-[2/3] w-32` após seleção

**Banner de destaque (opcional):**
- Aceita: `image/jpeg`, `image/png`, `image/webp`
- Max: 5 MB
- Bucket: mesmo bucket de imagens
- Proporção recomendada: 16:9 (indicar no label)
- Preview: `<img>` com `object-cover aspect-video w-48` após seleção

**Atenção:** Uploads de imagem devem ser client-side (mesma convenção do PDF/audio). Upload path: `{userId}/{timestamp}_{filename}`.

**Arquivo:** `components/publish/file-step.tsx`
- Adicionar props `coverProgress`, `bannerProgress`, `validateImage` em `FileStepProps`
- Adicionar campos `coverFile`, `coverStoragePath`, `bannerFile`, `bannerStoragePath`, `coverError`, `bannerError` em `PublishFormState` (`lib/hooks/use-publish-wizard.ts`)

### 3. Publish page — executar uploads de imagem

**Arquivo:** `app/(authenticated)/publish/page.tsx`

No `handlePublish`:
- Adicionar upload de `form.coverFile` → bucket `covers` (ou `avatars`) → armazenar path em `coverPath`
- Adicionar upload de `form.bannerFile` → mesmo bucket → armazenar em `bannerPath`
- Passar `coverPath` e `bannerPath` para `createMutation.mutateAsync`

```ts
// Após uploads de PDF e áudio:
let coverPath = form.coverStoragePath
let bannerPath = form.bannerStoragePath

if (!coverPath && form.coverFile) {
  coverPath = `${uid}/${Date.now()}_${form.coverFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  await uploadFile('covers', coverPath, form.coverFile, accessToken, setCoverProgress)
  updateForm({ coverStoragePath: coverPath })
}

if (!bannerPath && form.bannerFile) {
  bannerPath = `${uid}/${Date.now()}_${form.bannerFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  await uploadFile('covers', bannerPath, form.bannerFile, accessToken, setBannerProgress)
  updateForm({ bannerStoragePath: bannerPath })
}
```

### 4. tRPC `scripts.create` — aceitar `coverPath` e `bannerPath`

**Arquivo:** `server/api/scripts.ts`

- Adicionar `coverPath: z.string().optional()` e `bannerPath: z.string().optional()` no schema Zod do `create`
- Passar para o insert do Supabase

### 5. Bucket `covers` no Supabase (se não existir)

Verificar se o bucket `covers` existe. Se não:
```sql
-- Criar bucket via CLI
```
Ou reutilizar bucket `avatars` com subpasta `covers/`. Documentar a decisão com comentário no código.

---

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `server/db/schema.ts` | `coverPath` em `scripts` |
| `drizzle/` | Nova migration |
| `server/api/scripts.ts` | `create` aceita `coverPath`, `bannerPath`; `getById`/`listRecent`/`listFeatured`/`listByAuthor` retornam `cover_path`, `banner_path` |
| `lib/hooks/use-publish-wizard.ts` | Novos campos no form state |
| `components/publish/file-step.tsx` | Seções de upload de capa e banner |
| `app/(authenticated)/publish/page.tsx` | Executa uploads de imagem + passa para `create` |

---

## Acceptance criteria

- [ ] `cover_path` existe na tabela `scripts` no Supabase após migration
- [ ] Step 2 exibe campo de capa (aceita imagem, max 5MB, preview após seleção)
- [ ] Step 2 exibe campo de banner (aceita imagem, max 5MB, preview após seleção)
- [ ] Ao publicar: capa e banner são enviados para Storage; paths salvos no banco
- [ ] `getById` e `listRecent` retornam `cover_path` e `banner_path`
- [ ] `yarn build` sem erros de tipo
