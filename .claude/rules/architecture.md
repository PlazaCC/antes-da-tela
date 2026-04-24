# Arquitetura Limpa e Modularização

Este documento descreve diretrizes de arquitetura e modularização focadas na
stack do projeto (Next.js App Router, TypeScript, tRPC, Supabase, shadcn/ui,
Drizzle). Objetivo: melhorar legibilidade, separar responsabilidades,
reduzir duplicação e facilitar refatorações iterativas.

## Princípios

- Single Responsibility: cada módulo/component tem uma única responsabilidade.
- Separation of Concerns: UI, domínio, integrações e infra devem estar em
  camadas separadas (`components/`, `server/services/`, `lib/`, `trpc/`).
- DRY: evitar duplicação centralizando tokens, queries e helpers.
- Testabilidade: lógica de negócio em funções puras testáveis fora de componentes.

## Estrutura recomendada (onde colocar código)

- `app/` — rotas e layouts (Server Components por padrão). Fetch e rendering.
- `components/` — componentes de apresentação, wrappers de shadcn primitives.
- `lib/` — utilitários compartilhados, `cn()`, design tokens, helpers puros.
- `lib/hooks/` — hooks reutilizáveis com side-effects bem encapsulados.
- `server/services/` — lógica de domínio, queries encapsuladas, transações.
- `trpc/` — routers e procedures; use `ctx.supabase` para acesso DB com RLS.
- `server/db/schema.ts` e `drizzle/` — definição de schema e migrations.

## Regras práticas

- Server vs Client: mantenha fetch/queries em Server Components ou em
  `server/services/`. Client Components só para interatividade.
- tRPC: defina `publicProcedure` e `authedProcedure`; evite lógica de negócio
  diretamente no roteador — use `server/services`.
- Supabase: `createServerClient` em Server Components/API; `createBrowserClient`
  em Client Components. Não exponha `SERVICE_ROLE_KEY` ao cliente.
- Migrations: gerar via Drizzle; não edite migrações já aplicadas.

## DRY e reutilização

- Tokens visuais e classes → `design-tokens.ts` / `lib/constants`.
- Queries e transformações → funções em `server/services/*` retornando tipos
  bem tipados; reusar nas rotas e testes.

## Componentes e Hooks

- Componentes: < 100 linhas quando possível; aceitar `className` e repassá-lo.
- Hooks: encapsulam side-effects; retornam estado mínimo e callbacks.
- Separar componentes puros (render) de containers (estado/handlers).

## Refatoração incremental

- Quando encontrar duplicação, extraia helper/hook e escreva testes antes de
  substituir os usos existentes.
- Prefira PRs pequenos e reversíveis; coloque `BREAKDOWN.md` em mudanças
  maiores explicando motivação e passos.

## Checklist para PRs de arquitetura/refactor

- [ ] Lint e type-check passam localmente (`yarn lint`, `yarn type-check`).
- [ ] Testes relevantes adicionados/modificados e passam (`yarn test`).
- [ ] Mudanças de schema têm migration gerada (`yarn db:generate`).
- [ ] Nenhuma chave secreta exposta; tokens movidos para `lib/constants`.
- [ ] Descrição do PR explica motivação e lista arquivos alterados.

## Recursos e referências

- Next.js App Router patterns
- Clean Architecture / Uncle Bob — princípios aplicados na prática
- Drizzle ORM migrations guide
