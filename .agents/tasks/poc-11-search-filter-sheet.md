---
title: "Mobile search sheet and filter page"
type: frontend
priority: P1
branch: feature/search-filter-sheet
---

## Objective
Implement the `Search Sheet` and `Filter Page` Figma screens: a bottom-sheet for mobile search autocomplete and a full-screen filter panel for genre/age-rating multi-select, consistent with the Figma designs.

## Context
- Figma frames: `Search Sheet` nodeId `51:820`; `Filter Page` nodeId `51:930` — seção `Fluxo principal` (186:1388)
- Buscar specs via `mcp__Framelink_Figma_MCP__get_figma_data(fileKey="iUb8odefGSZiHz4KjuzX1M", nodeId="51:820")` e `nodeId="51:930"`
- Assets locais (SVGs/PNGs) foram removidos — usar Framelink MCP como fonte de referência visual
- `NavBarSearch` at `components/navbar-search.tsx` already handles desktop search via URL params with 300ms debounce
- shadcn `Sheet` component not yet installed; `Checkbox` and `Radio box` components exist at `components/ui/`
- `GENRES` constants at `lib/constants/scripts.ts`; `AGE_RATINGS` also available
- `FilterSectionHeader` figmaNodeId: `48:1122` — buscar via Framelink MCP

## Steps
1. Install shadcn Sheet: `yarn dlx shadcn@latest add sheet`. Create `components/search-sheet/search-sheet.tsx` — a bottom drawer (Sheet from bottom) with an `Input` and a list of recent/suggested scripts using `trpc.scripts.search`; opens from a search icon in NavBar on mobile (`md:hidden`).
2. Create `components/filter-panel/filter-panel.tsx` — Sheet or full-page overlay with `FilterSectionHeader` sections for Genre (Checkbox multi-select) and Age Rating (RadioBox single-select); on Apply, updates URL params `genre` and `age_rating` and closes panel.
3. Wire the filter trigger button in `HomeClient` to open the filter panel; update `trpc.scripts.search` input in `HomeClient` to pass `ageRating` param (add to router if missing).

## Acceptance criterion
`yarn build` passes; on 375px viewport, tapping the search icon opens the search sheet; tapping "Filtrar" opens the filter panel and applying updates the grid.

## Artifacts
- `components/search-sheet/search-sheet.tsx`
- `components/filter-panel/filter-panel.tsx`
- Updated `components/navbar.tsx` or `components/navbar-search.tsx`
- Updated `app/home-client.tsx`

## Completion

- [x] `components/search-sheet/search-sheet.tsx` created (bottom Sheet, search input + live results via `trpc.scripts.search`, debounced 300ms)
- [x] `components/filter-panel/filter-panel.tsx` created (left Sheet, Genre checkboxes + Age Rating checkboxes, Aplicar Filtros updates URL params)
- [x] `components/navbar-mobile-controls.tsx` created (client component with SearchIcon md:hidden, manages SearchSheet state)
- [x] `components/navbar.tsx` updated — mobile: shows NavBarMobileControls; desktop: NavBarSearch hidden md:block
- [x] `app/home-client.tsx` updated — "Filtrar" button wired to FilterPanel, `age_rating` URL param passed to search query
- [x] `server/api/scripts.ts` search endpoint updated with `ageRating` filter
- [x] `yarn build` passes
