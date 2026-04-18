# Task Review Summary — 2026-04-17 (atualizado)

## Status geral

- Tasks poc-01 a poc-07: **arquivadas** (implementadas)
- Tasks poc-08 e poc-09: **executadas** (E2E validation + Storage buckets)
- Task poc-10: **executada** (ScriptPreviewModal)
- Tasks poc-11 a poc-14: **pendentes** (ver `.agents/tasks/`)
- Tasks poc-15 a poc-20: **novas** (correções de design + perfil + wizard) — em `.agents/tasks/`

## Mudança de referência visual (2026-04-17)

Assets locais `.agents/figma/components/*.svg` e `.agents/figma/screens/*.png` foram **removidos**.
A fonte de referência visual agora é o Figma via Framelink MCP:

```
mcp__Framelink_Figma_MCP__get_figma_data(
  fileKey="iUb8odefGSZiHz4KjuzX1M",
  nodeId="<nodeId>"
)
```

Metadados atualizados:

- `.agents/figma.meta.json` — v2 (sections-based, não pages-based)
- `.agents/design-system.meta.json` — v4 (hex values confirmados via Figma)

## Ordem de execução recomendada

### P0 — Fundação (executar primeiro, bloqueiam tudo)

| Task                | Arquivo                              | Status   |
| ------------------- | ------------------------------------ | -------- |
| Correção tokens CSS | `poc-15-design-token-corrections.md` | pendente |

### P1 — Correções de design e componentes críticos

| Task                        | Arquivo                                    | Status                 |
| --------------------------- | ------------------------------------------ | ---------------------- |
| Header redesign             | `poc-16-header-redesign.md`                | concluído              |
| Avatar + FollowButton       | `poc-17-avatar-followbutton-components.md` | concluído              |
| Search Sheet + Filter Page  | `poc-11-search-filter-sheet.md`            | pendente               |
| ScriptModal design revision | `poc-18-scriptmodal-design-revision.md`    | pendente (dep: poc-17) |
| Upload wizard redesign      | `poc-20-upload-wizard-redesign.md`         | pendente               |
| SEO/OG meta                 | `poc-12-script-seo-og-meta.md`             | pendente               |

### P2 — Features e perfil

| Task                    | Arquivo                       | Status                 |
| ----------------------- | ----------------------------- | ---------------------- |
| Profile pages (3 telas) | `poc-19-profile-pages.md`     | pendente (dep: poc-17) |
| Audio player            | `poc-13-audio-player.md`      | pendente               |
| Comment reactions       | `poc-14-comment-reactions.md` | pendente               |

## Dependências

```
poc-15 → base para tudo
poc-17 (Avatar + FollowButton) → poc-18, poc-19
poc-16 (Header) → poc-19, poc-20
```

## NodeIds Figma confirmados (seções)

- Fluxo principal: `186:1388`
- Fluxo cadastro roteiro: `186:1350`
- Perfil do usuário: `186:2075`
