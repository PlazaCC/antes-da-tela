# poc-23 — Busca: alinhamento ao Figma

**Scope:** Frontend  
**Priority:** P2  
**Status:** pending  
**Figma:** Search Sheet `51:820`, Filter Page `51:930`

---

## O que já está feito ✓

- `SearchSheet` — bottom sheet, input com debounce 300ms, lista de resultados (título + autor) ✓
- `FilterPanel` — left sheet, checkboxes gênero + classificação etária, "Limpar tudo" ✓
- Integrados na Home via `home-client.tsx` ✓

---

## Referência visual
O padrão aprovado na Home e no perfil público usa cobertura de capa em todos os ScriptCards. A busca deve ser consistente com isso.

---

## Gaps

### 1. SearchSheet — resultados com cover thumbnail

Os resultados atuais mostram apenas título + autor em texto simples. O Figma mostra cards compactos com miniatura de capa, gênero e autor.

**Arquivo:** `components/search-sheet/search-sheet.tsx`

Substituir o `<Link>` atual por um card compacto:

```tsx
<Link
  key={script.id}
  href={`/scripts/${script.id}`}
  onClick={() => onOpenChange(false)}
  className="flex items-center gap-3 px-5 py-3 border-b border-border-subtle hover:bg-elevated transition-colors">
  {/* Miniatura de capa */}
  <div className="w-9 aspect-[4/5] shrink-0 rounded-sm bg-elevated border border-border-subtle overflow-hidden relative">
    {script.cover_url && (
      <Image src={script.cover_url} alt={script.title} fill className="object-cover" />
    )}
  </div>
  {/* Info */}
  <div className="flex flex-col gap-0.5 min-w-0">
    <span className="text-sm text-text-primary truncate">{script.title}</span>
    <span className="font-mono text-[10px] text-text-muted uppercase">
      {[script.genre, script.author?.name].filter(Boolean).join(' · ')}
    </span>
  </div>
</Link>
```

> Verificar que `scripts.search` retorna `cover_url` (URL pública resolvida, não o path bruto). Se não, adicionar ao select no tRPC router.

### 2. SearchSheet — link "Ver todos os resultados"

Adicionar rodapé no sheet quando `results.length > 0` e `safeQuery.length >= 2`:

**Arquivo:** `components/search-sheet/search-sheet.tsx`

```tsx
{/* Rodapé do sheet */}
{results && results.length > 0 && safeQuery.length >= 2 && (
  <div className="px-5 py-3 border-t border-border-subtle shrink-0">
    <Link
      href={`/?q=${encodeURIComponent(safeQuery)}`}
      onClick={() => onOpenChange(false)}
      className="font-mono text-label-mono-small text-brand-accent hover:underline underline-offset-4">
      Ver todos os resultados para "{safeQuery}"
    </Link>
  </div>
)}
```

### 3. FilterPanel — "Aplicar Filtros" deve aplicar antes de fechar

Atualmente o botão fecha o sheet sem garantir que os filtros sejam escritos na URL.

**Arquivo:** `components/filter-panel/filter-panel.tsx`

```tsx
{/* Antes */}
<button onClick={() => onOpenChange(false)}>Aplicar Filtros</button>

{/* Depois — chamar apply() antes de fechar */}
<button onClick={() => {
  apply(genres, ageRatings)
  onOpenChange(false)
}}>
  Aplicar Filtros
</button>
```

> `apply` vem de `useFilterParams`. Verificar se o FilterPanel já tem acesso ao hook ou se precisa receber `apply` como prop.

---

## Mobile & Tablet (Figma é desktop-only — especificação adicional)

SearchSheet e FilterPanel já são sheets (bottom e left). Garantir que funcionem bem em telas pequenas.

### SearchSheet — touch targets nos resultados

Cada item de resultado deve ter `min-h-[44px]` para atender ao requisito de toque:

```tsx
<Link className="flex items-center gap-3 px-5 min-h-[44px] border-b border-border-subtle hover:bg-elevated ...">
```

### SearchSheet — altura no mobile

O SearchSheet já é um bottom sheet. Garantir que em phone ele não ultrapasse 85% da viewport:

```tsx
<SheetContent side="bottom" className="h-[85vh] max-h-[85dvh] flex flex-col p-0">
```

Usar `dvh` para respeitar a viewport dinâmica do iOS Safari (barra de endereço recolhe durante scroll).

### SearchSheet — input e teclado

No mobile, ao abrir o sheet o input de busca deve ganhar foco automaticamente para que o teclado virtual apareça. Adicionar `autoFocus` no `<Input>` dentro do sheet:

```tsx
<Input autoFocus placeholder="Buscar roteiros..." ... />
```

O input deve ter `min-h-[44px]` e `text-base` (nunca menor que 16px) para evitar o zoom automático do iOS:

```tsx
<Input className="min-h-[44px] text-base ..." />
```

### FilterPanel — largura no mobile

O FilterPanel é um left sheet. Em phone ele deve ocupar largura total (ou quase): garantir que o `SheetContent` use `w-full sm:w-[380px]` ao invés de uma largura fixa que não caiba em telas estreitas.

### Cover thumbnail — tamanho fixo

O `w-9` da miniatura é ~36px — suficiente para display mas verificar que a imagem não distorce em telas de alta densidade (usar `sizes="36px"` no `<Image>`).

---

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `components/search-sheet/search-sheet.tsx` | Cards com cover, link "ver todos", touch targets, dvh, autoFocus, input text-base |
| `components/filter-panel/filter-panel.tsx` | Chamar `apply()` antes de fechar, largura `w-full sm:w-[380px]` |
| `server/api/scripts.ts` | Se necessário: incluir `cover_url` no retorno de `search` |

---

## Acceptance criteria

- [ ] SearchSheet: cada resultado mostra miniatura de capa (placeholder se sem capa), nome do gênero e autor
- [ ] SearchSheet: link "Ver todos os resultados para X" aparece quando há resultados e query ≥ 2 chars
- [ ] SearchSheet: cada item tem `min-h-[44px]` (touch target)
- [ ] SearchSheet: input com `autoFocus`, `min-h-[44px]`, `text-base` (≥16px — sem zoom iOS)
- [ ] SearchSheet: altura `h-[85dvh]` no mobile
- [ ] FilterPanel: "Aplicar Filtros" aplica os filtros na URL antes de fechar o sheet
- [ ] FilterPanel: largura `w-full sm:w-[380px]` (ocupa tela inteira em phone)
- [ ] `yarn build` sem erros de tipo
