---
name: poc-next-task
description: >-
  Determines the current POC state, verifies the previous task's acceptance
  criteria are fully met, and executes the next task end-to-end. Never skips
  ahead — each task's checklist must pass before the next begins.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# POC — Next Task Executor

## Objective

Determine the current POC state, verify the previous task is complete, and execute the next task.
Never skip ahead — each task's acceptance criteria must pass before the next begins.

---

## Step 1 — Read the execution order

Read `.agents/tasks/poc-overview.md` to understand:

- The mandatory execution order (`[01]` → `[07]`)
- The dependency rules (what blocks what)
- The validation commands for each task

---

## Step 2 — Determine current state

Run the following to map the repo state:

# POC — Next Task Executor (Atualizado)

## Objetivo

Determinar o estado atual do POC, validar critérios de aceite da task anterior e executar a próxima task.
Nunca pule etapas — cada checklist deve ser cumprido antes de avançar.

---

## Fonte da Verdade de Design

**Sempre utilize o Figma via MCP FramLink como fonte primária para tokens, componentes e layouts.**

- Os arquivos locais `.agents/figma.meta.json` e `.agents/design-system.meta.json` servem apenas como apoio/fallback.
- Não há mais assets locais em `.agents/figma/` — ignore qualquer menção a SVG/PNG/PDF locais.
- Os links oficiais do Figma para referência são:
  - Fluxo principal: https://www.figma.com/design/iUb8odefGSZiHz4KjuzX1M/Antes-da-Tela-%E2%80%94-Design-System?node-id=186-1388
  - Cadastro de roteiro: https://www.figma.com/design/iUb8odefGSZiHz4KjuzX1M/Antes-da-Tela-%E2%80%94-Design-System?node-id=186-1350
  - Perfil do usuário: https://www.figma.com/design/iUb8odefGSZiHz4KjuzX1M/Antes-da-Tela-%E2%80%94-Design-System?node-id=186-2075

---

## Passos principais

1. Carregue `.agents/poc-context.json` para obter `execution_order` e tasks.
2. Identifique a task alvo (próxima pendente ou fornecida via `task_id`).
3. Valide critérios de aceite locais:

- `yarn build` (zero erros)
- `yarn lint` (zero warnings)
- `yarn drizzle-kit generate` se schema foi alterado

4. Para qualquer necessidade de design (tokens, componentes, layouts):

- Consulte sempre o Figma via MCP FramLink (`mcp_framelink_fig_get_figma_data`) usando os links oficiais e nodeIds relevantes.
- Use arquivos locais de metadados apenas se MCP não estiver disponível.

5. Atualize checklists das tasks conforme critérios verificados.
6. Nunca execute `git commit` ou `git push` — apenas gere sugestões de commit.

---

## Regras operacionais

- Sempre priorize o Figma via MCP FramLink.
- Ignore qualquer instrução para buscar assets locais em `.agents/figma/`.
- Arquivos locais `.agents/figma.meta.json` e `.agents/design-system.meta.json` são apenas fallback.
- Nunca grave tokens ou segredos em arquivos do projeto.
- Mudanças mínimas e focadas; não reescreva seções não relacionadas.

---

## Exemplo de fluxo

1. Validar critérios locais (`yarn build`, `yarn lint`, etc.)
2. Consultar Figma via MCP para obter tokens/componentes/layouts necessários
3. Atualizar metadados locais apenas se MCP não estiver disponível
4. Atualizar checklist da task
5. Gerar sugestão de Conventional Commit

---

## Constraints

- Nunca use `npm install` — sempre `yarn add`.
- Tailwind v3 apenas — não use sintaxe v4.
- Use `cn()` de `@/lib/utils` para composição de classes.
- `createServerClient` em Server Components, `createBrowserClient` em Client Components.
- Fonte de schema: `server/db/schema.ts` — nunca edite migrations geradas diretamente.
- Todo output (código, comentários, commits, docs) em inglês.

2. Implement all required files, components, routes, schemas, and configurations.
