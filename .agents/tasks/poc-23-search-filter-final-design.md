# poc-23 — Search + Filter: depar final

**Scope:** Frontend  
**Priority:** P2  
**Status:** pending  
**Figma:** Search Sheet `51:820`, Filter Page `51:930`

---

## O que já está feito

- `SearchSheet` (`components/search-sheet/search-sheet.tsx`): bottom sheet, input com debounce 300ms, lista de resultados com título + autor ✓
- `FilterPanel` (`components/filter-panel/filter-panel.tsx`): left sheet, checkboxes de gênero e classificação etária, "Limpar tudo" + "Aplicar Filtros" ✓
- Ambos integrados na Home via `home-client.tsx` ✓

---

## Gaps

### 1. SearchSheet — sem link para "ver todos os resultados"

O SearchSheet atual lista resultados como links diretos para `/scripts/[id]`. O Figma (Filter Page `51:930`) implica que deveria haver uma rota de resultados completos. Para POC: basta adicionar um link "Ver todos os resultados para '{query}'" que navega para a Home com `?q=<query>` aplicado — a Home já suporta isso via `useFilterParams`.

**Arquivo:** `components/search-sheet/search-sheet.tsx`
- Adicionar no rodapé do sheet: botão/link "Ver todos os resultados" → `/?q=<query>` (fecha o sheet)

### 2. FilterPanel — botão "Aplicar Filtros" não fecha e aplica simultaneamente

Atualmente o botão fecha o sheet mas não garante que os filtros sejam aplicados à URL antes de fechar. Verificar se `useFilterParams.apply()` é chamado antes de `onOpenChange(false)`.

**Arquivo:** `components/filter-panel/filter-panel.tsx`
- No clique do botão "Aplicar Filtros": chamar `apply(genres, ageRatings)` antes de fechar

### 3. ScriptCard nos resultados da Home sem cover (depar menor)

Quando filtros estão ativos, a seção de resultados mostra ScriptCards sem cover. Isso será resolvido pelo poc-21 (que adiciona `coverUrl` ao ScriptCard). Não há ação aqui além de confirmar que o campo é passado após poc-21.

---

## Acceptance criteria

- [ ] SearchSheet: link "Ver todos os resultados" presente quando query tem ≥ 2 chars; navega para `/?q=<query>`
- [ ] FilterPanel: "Aplicar Filtros" aplica os filtros na URL e fecha o sheet
- [ ] `yarn build` sem erros de tipo
