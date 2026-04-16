# [01a] Design Tokens — Auditoria e Normalização

> Status: pending · Priority: urgent · Depends on: poc-01

## Objetivo

Auditar e normalizar todas as variáveis CSS do design system para usar HSL channel tokens (sem `hsl()` wrapper), garantir mapeamento consistente para o `tailwind.config.ts` e atualizar `.agents/design-system.meta.json` com o mapa definitivo.

## Passos

1. Rodar export Framelink MCP: `get_metadata(fileKey="iUb8odefGSZiHz4KjuzX1M", nodeId="0:1")` e identificar tokens de cor/typography.
2. Validar os valores atuais em `app/globals.css` — converter qualquer hex para HSL channels.
3. Atualizar `.agents/design-system.meta.json` -> `exportContext.cssVars` com os channel strings e `tailwindMapping`.
4. Atualizar `tailwind.config.ts` para consumir `hsl(var(--...))` e verificar `safelist` se necessário.
5. Rodar `yarn build` e `yarn lint`.

## Acceptance

- [x] Todas as CSS vars estão no formato HSL channels (ex: `0 0% 5%`) em `app/globals.css`.
- [x] `tailwind.config.ts` usa `hsl(var(--...))` para tokens.
- [x] `.agents/design-system.meta.json` atualizado com mapping e instruções de export.
- [ ] `yarn build` e `yarn lint` passam sem erros.

## Files a tocar

- `app/globals.css`
- `tailwind.config.ts`
- `.agents/design-system.meta.json`
