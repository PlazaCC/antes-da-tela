# Task Summary — 2026-04-23 (revisado)

## Fase 1 (poc-01 a poc-20): COMPLETO ✓

---

## Fase 2 — Design final (poc-21 a poc-26)

### Telas aprovadas — referência de qualidade

As seguintes telas foram implementadas além do wireframe do Figma e definem o padrão visual e de responsividade para todas as próximas:

| Tela | Rota | Status |
|---|---|---|
| Home | `/` | ✓ Aprovada |
| Perfil público | `/profile/[userId]` | ✓ Aprovada |
| Editar Perfil | `/profile/edit` | ✓ Aprovada |
| Dashboard | `/profile/dashboard` | ✓ Aprovada |
| Meus Roteiros | `/profile/scripts` | ✓ Aprovada |
| Upload Wizard | `/publish` | ✓ Aprovada |

**O que diferencia as telas aprovadas do wireframe:**
- Hero carousel com gradiente cinematográfico e tipografia editorial
- Cover placeholder consistente (`aspect-[4/5]`) em todos os cards
- Breakpoints fluidos com Tailwind (mobile-first)
- Uso de `bg-elevated/40` + `border-border-subtle` para profundidade sutil
- Ações do autor integradas no layout sem CTA separado

---

### Nota global — Mobile-first obrigatório

> **O Figma cobre apenas 1440px (desktop).** Toda tela pendente deve ser implementada mobile-first: phone (<768px), tablet (768–1023px), desktop (≥1024px). Cada task file inclui uma seção "Mobile & Tablet" com specs específicas derivadas das telas aprovadas + UI/UX Pro Max guidelines.
>
> Regras globais para todas as telas:
> - Touch targets ≥44×44px em todos os elementos interativos
> - `text-base` (16px mínimo) em todos os inputs para evitar zoom automático no iOS
> - `min-h-dvh` ao invés de `min-h-screen` (respeita viewport dinâmica do iOS Safari)
> - `env(safe-area-inset-bottom)` em qualquer elemento fixo no rodapé
> - Nunca usar `hover` como único indicador de interatividade
> - Sem scroll aninhado no mobile

### Prioridades — tarefas pendentes

```
P0 — poc-27: PDF Viewer: migrate to react-pdf (zoom overflow bug + fundação áudio-texto)
P1 — poc-21: Home (infinite scroll + remover título "Roteiros recentes" + mobile grid)
P1 — poc-22: Modal Preview (audio player no sidebar + mobile layout)
P2 — poc-23: Busca (alinhamento ao Figma + touch targets + mobile sheet)
P4 — poc-25: Upload Wizard (alinhamento ao Figma — PreviewPanel + mobile CTA + UX)
```

### Status das tasks

| Task | Arquivo | Prioridade | Status | Escopo |
|---|---|---|---|---|
| poc-27 — PDF Viewer: react-pdf | `poc-27-pdf-viewer-react-pdf.md` | **P0** | pending | Migração de pdfjs-dist manual para react-pdf; resolve zoom overflow; preserva text layer e Zustand store |
| poc-24 — Tela do Roteiro | `poc-24-pdf-reader-final-design.md` | **P0** | **done** | Hero banner condicional, breadcrumbs, sinopse visível, tabs sidebar, sticky desktop, mobile sheet + FAB, no-PDF redesenhado |
| poc-21 — Home: infinite scroll | `poc-21-home-final-design.md` | **P1** | pending | Infinite scroll + remover "Roteiros recentes" + grid mobile 2/3/4/5 cols |
| poc-22 — Modal: audio | `poc-22-script-modal-final-design.md` | **P1** | pending | AudioPlayer no sidebar + mobile full-screen + touch targets |
| poc-23 — Busca: Figma align | `poc-23-search-filter-final-design.md` | **P2** | pending | Cards com cover, link "ver todos", fix apply filter, touch targets, dvh |
| poc-25 — Upload Wizard | `poc-25-upload-wizard-figma-align.md` | **P4** | pending | PreviewPanel ao vivo, heading por step, logline counter, cover na revisão, mobile sticky CTA |

### Completo

| Task | Descrição | Status |
|---|---|---|
| poc-26 | Dashboard + Profile flow | ✓ DONE |
| poc-25 | Upload Wizard — cover + banner uploads | ✓ DONE |
| poc-24 | PDF Reader — hero condicional, tabs sidebar, sticky desktop, synopsis, mobile sheet | ✓ DONE |

---

## Estado atual por tela

| Tela | Implementado | Falta |
|---|---|---|
| Home | Carousel banners, genre chips, grid, featured, filtros, cover nos cards | Infinite scroll, remover título "Roteiros recentes" |
| Tela do Roteiro | Banner (sutil), cover, título, logline, autor, rating, PDF viewer, comments, audio, ações | Zoom do PDF vaza container (poc-27 — migrar react-pdf) |
| Modal Preview | 2 painéis, cover, author, stats, tags, sidebar metadata | AudioPlayer no sidebar |
| Search Sheet | Bottom sheet, input, resultados texto | Cards com cover, link "ver todos" |
| Filter Panel | Checkboxes gênero + classificação | Fix: apply antes de fechar |
| Upload Wizard | 4 steps completos, PDF + audio + cover + banner | — |
| Perfil público | Banner, avatar, stats, tabs, grid | — |
| Editar Perfil | Nav sidebar, avatar upload, nome/bio, form | — |
| Dashboard | Sidebar, MetricCards, tabela, ações editar/excluir | — |

---

## Figma references

- **File key:** `iUb8odefGSZiHz4KjuzX1M`
- Full component map: `.agents/figma.meta.json`
- Design tokens: `.agents/design-system.meta.json`

| Screen | nodeId |
|---|---|
| Home | `51:562` |
| Modal/Roteiro | `51:718` |
| Search Sheet | `51:820` |
| Filter Page | `51:930` |
| PDF Reader | `51:1007` |
| Upload Step 1 | `115:1008` |
| Upload Step 2 | `115:1075` |
| Upload Step 3 | `125:1430` |
| Upload Step 4 | `128:1691` |
| Perfil do Usuário | `186:1834` |
| Editar Perfil | `186:1907` |
| Dashboard | `186:1963` |
