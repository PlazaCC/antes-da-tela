# poc-21 — Home: design final

**Scope:** Frontend + Backend
**Priority:** P1
**Status:** pending
**Figma:** Home `51:562` — seção `186:1388`
**Depends on:** poc-25 (precisa de `cover_path` e `banner_path` no schema)

---

## O que já está feito

- Genre chips com estado ativo brand-accent ✓
- Grid 3 colunas / 1 mobile ✓
- Seção "Em destaque" via `is_featured` (ScriptCards sem banner) ✓
- Filtro por gênero e busca com debounce ✓
- `ScriptCard` com hover brand-accent ✓

---

## Gaps

### 1. Schema — coluna `cover_path` em `scripts`

A tabela `scripts` tem `banner_path` (para o banner visual da Home) mas **não tem `cover_path`** (imagem de capa 2:3 para o ScriptCard).

> **Atenção:** Este gap é resolvido na poc-25. Não executar aqui — só verificar que a migration já foi aplicada antes de prosseguir.

### 2. ScriptCard — cover thumbnail

`ScriptCard` não exibe imagem de capa. Adicionar:

- Prop `coverUrl?: string | null`
- Placeholder visual `aspect-[4/5]` com bg `bg-elevated` quando `coverUrl` é null
- Se `coverUrl` existe: `<img>` com `object-cover w-full h-full`

**Arquivo:** `components/script-card/script-card.tsx`

### 3. Seção "Em Destaque" com banners (POC-level)

A seção "Em destaque" atual usa `is_featured` e exibe ScriptCards simples. O objetivo é substituí-la por uma apresentação visual usando o `banner_path` dos scripts — um banner horizontal ou carrossel de destaque.

Criar uma função JS server-side simples que busca scripts com `banner_path` preenchido e `is_featured = true`:

```ts
// POC: busca roteiros em destaque que possuem banner_path para exibição visual na Home.
// Não otimizado para escala — join manual em JS intencional para facilitar ajuste futuro.
async function getFeaturedWithBanners(supabase) {
  const { data } = await supabase
    .from('scripts')
    .select('id, title, genre, banner_path, author:users!author_id(id, name)')
    .eq('status', 'published')
    .eq('is_featured', true)
    .not('banner_path', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5)

  return data ?? []
}
```

- Adicionar endpoint `scripts.listFeaturedWithBanners` no tRPC router (ou inline no Server Component)
- A seção "Em Destaque" exibe banners horizontais (`aspect-video` ou proporção livre) quando scripts com `banner_path` existem
- Se nenhum script tiver `banner_path`, cai back para o grid de ScriptCards com `is_featured = true` (comportamento atual)
- URL pública do banner deve ser resolvida server-side via `supabase.storage.from('covers').getPublicUrl(banner_path)`

**Arquivo:** `app/page.tsx` (Server Component) ou `app/home-client.tsx`

---

## Arquivos a modificar

| Arquivo                                  | Mudança                                                                                                                                                   |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/api/scripts.ts`                  | Endpoint `listFeaturedWithBanners`; incluir `cover_path` e `banner_path` nos selects existentes (`getById`, `listRecent`, `listFeatured`, `listByAuthor`) |
| `components/script-card/script-card.tsx` | Prop `coverUrl` + placeholder 2:3                                                                                                                         |
| `app/home-client.tsx`                    | Seção "Em Destaque" com banners (fallback para ScriptCards se sem banner)                                                                                 |

---

## Acceptance criteria

- [ ] `ScriptCard` exibe placeholder `aspect-[4/5]` quando sem capa; imagem `cover_url` quando presente
- [ ] Seção "Em Destaque" exibe banner visual quando scripts com `banner_path` existem
- [ ] Fallback: se nenhum script tiver `banner_path`, exibe ScriptCards (comportamento atual)
- [ ] `listFeaturedWithBanners` tem comentário `// POC` explicando o join manual em JS
- [ ] `yarn build` sem erros de tipo
