---
paths:
  - 'server/**'
  - 'lib/**'
  - 'components/**'
  - 'trpc/**'
---

# Arquitetura Limpa & Modularização (VS Code Agents)

Diretrizes práticas para manter o código modular, testável e fácil de refatorar
no contexto deste repositório (Next.js App Router, tRPC, Supabase, Drizzle,
shadcn/ui). Use este arquivo como checklist / checklist de revisão automática.

## Objetivos

- Separar responsabilidades e minimizar acoplamento.
- Facilitar mudanças iterativas e refatorações pequenas.
- Reduzir duplicação e promover reutilização via `lib/` e `server/services/`.

## Convenções de pasta

- `app/`: rotas, layouts e Server Components.
- `components/`: componentes puros e wrappers shadcn; aceitar `className`.
- `lib/`: utilitários, `cn()`, tokens, e helpers puros.
- `lib/hooks/`: hooks reutilizáveis com efeitos bem encapsulados.
- `server/services/`: regras de negócio e queries reutilizáveis.

## Regras essenciais

- Single Responsibility: funções e módulos com uma única razão para mudar.
- Pure functions para transformação de dados; side-effects em `services`/hooks.
- Evite `any` e prefira tipos explícitos; exporte tipos compartilhados quando
  necessário.
- Normalizar chamadas a APIs e DB em `server/services/*` para facilitar testes
  e mocks.

## PR e revisão

- PRs de refactor: pequenos, com testes. Documente o escopo na descrição.
- Antes de merge: `yarn lint`, `yarn test`, `yarn type-check`.

## Checklist rápido

- [ ] Código novo em `server/services` testado com unit tests
- [ ] Componentes pequenos e reusáveis
- [ ] Tokens centralizados (`lib/constants`)
- [ ] Nenhuma lógica de negócio em componentes
