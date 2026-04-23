# Task Summary — 2026-04-22 (revisado)

## Phase 1 (poc-01 to poc-20): COMPLETE ✓

---

## Phase 2 — Design final (poc-21 to poc-26)

### Prioridades e dependências

```
poc-26 (Dashboard: Edição e Exclusão de Roteiros) — P0, PRÓXIMA A EXECUTAR
  └── poc-25 (Upload/Edit: cover + banner) — P0, SEGUNDA A EXECUTAR
        └── poc-21 (Home: cover thumbnail + "Em Alta")
              └── poc-22 (Modal: cover + audio no sidebar)

poc-24 (PDF Reader mobile)  — independente
poc-23 (Search/Filter)      — independente, P2
```

### Status das tasks

| Task | Arquivo | Prioridade | Status | Escopo real |
|---|---|---|---|---|
25: | poc-26 — Dashboard + Profile | `poc-26-profile-flow-final-design.md` | **P0** | pending | **Edição/Exclusão de roteiros e capas**, Depar ScriptCards |
26: | poc-25 — Upload: capa e banner | `poc-25-upload-wizard-final-design.md` | **P0** | pending | Schema migration + upload de capa e banner no FileStep |
| poc-21 — Home: "Em Alta" + cover | `poc-21-home-final-design.md` | **P1** | pending | Seção hot (JS/POC) + ScriptCard cover thumbnail |
| poc-22 — Modal: cover + player | `poc-22-script-modal-final-design.md` | **P1** | pending | Cover placeholder + AudioPlayer no sidebar |
| poc-24 — PDF Reader mobile | `poc-24-pdf-reader-final-design.md` | **P1** | pending | Breadcrumbs + player fixo mobile + comments sheet |
| poc-23 — Search/Filter depar | `poc-23-search-filter-final-design.md` | **P2** | pending | 2 ajustes menores (link resultados + apply fix) |

### O que já está feito em cada tela

| Tela | Implementado | Falta |
|---|---|---|
| Home | Genre chips, grid, featured, filtros | Cover no ScriptCard, seção "Em Alta" |
| Script Modal | 2 painéis, author, stats, tags | Cover placeholder, audio no sidebar |
| Search Sheet | Bottom sheet com busca + resultados | Link "ver todos os resultados" |
| Filter Panel | Gênero + classificação + checkboxes | Apply antes de fechar |
| PDF Reader | Viewer, controles, comments, reactions | Breadcrumbs, mobile player fixo, comments sheet |
| Upload Wizard | 4 steps completos, PDF + audio | Cover image upload, banner image upload |
| Perfil público | Banner, avatar, stats, FollowButton, grid | Cover no ScriptCard (dep poc-21) |
43: | Editar Perfil | Nav sidebar, avatar upload, nome/bio | - |
| Dashboard | Sidebar, MetricCards, tabela | **Ações de Editar e Excluir Roteiro** |

---

## Figma references

- **File key:** `iUb8odefGSZiHz4KjuzX1M`
- **MCP tool:** `mcp__Framelink_Figma_MCP__get_figma_data(fileKey, nodeId)`
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
