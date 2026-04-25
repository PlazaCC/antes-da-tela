# Component Rules

## File length

- Target: **≤ 100 lines** per file.
- Hard limit: **150 lines**. Files beyond this must be split — no exceptions without a written justification comment.
- Exception: pure-data files (lookup tables, long class lists) may exceed with an explanatory comment.

## When to extract a sub-component

Extract when any of these conditions hold:

- A JSX block repeats more than once with different props.
- A logical section owns its own state or side-effects.
- A named UI concept is emerging (e.g. `RatingBox`, `PdfControls`, `OwnerActions`).
- Either branch of a conditional renders > 15 lines.

## When to extract a hook

- Multiple `useState` + `useEffect` calls serve a single concern → `lib/hooks/use-<name>.ts`.
- The same stateful logic is needed by two or more components.

Examples already in the codebase:

- `useAudio` — audio playback state + event listeners
- `useProgressScrubber` — scrubber drag/touch → seek ratio

## File naming and placement

| Type                          | Location                         | Convention                |
| ----------------------------- | -------------------------------- | ------------------------- |
| Page-level component          | `app/<route>/`                   | `PascalCase` named export |
| Feature component             | `components/<domain>/<name>.tsx` | kebab-case filename       |
| Custom hook                   | `lib/hooks/use-<name>.ts`        | `camelCase` named export  |
| Sub-component (single parent) | same directory as parent         | same naming               |
| shadcn primitive              | `components/ui/` — **CLI only**  | never create manually     |

## Naming conventions

- Components: `PascalCase`, named export, no default exports.
- Hooks: `use` prefix, named export.
- Props: `<ComponentName>Props` interface or inline when trivial (≤ 3 props).
- Always accept and forward `className` on wrapper components; merge with `cn()`.

## Composition

- Keep JSX nesting ≤ 4 levels. Deeper → extract a sub-component.
- Use `asChild` (Radix Slot) to compose without extra DOM nodes.
- Nested ternaries → extract instead.
- No `asChild` gymnastics when a simple wrapper is clearer.

## Comments

- Zero comments by default.
- Add one **only** when the WHY is non-obvious: browser quirk, hidden constraint, workaround for a specific bug.
- Never describe WHAT the code does.

## Modularização, Clean Architecture e DRY

- Separe responsabilidades claramente: `components/` (apresentação), `lib/hooks` (comportamento reutilizável), `server/services` (regras de negócio), `server/api`/`trpc` (contratos de API).
- Use composição: componentes pequenos e previsíveis, orquestradores (containers) que ligam hooks/serviços.
- Evite duplicação:
  - Centralize constantes e tokens em `lib/constants`.
  - Centralize chamadas a APIs e queries em `server/services/*` ou `lib/api/*` com testes.
  - Se um trecho de JSX aparece mais de 1 vez, extraia componente/Hook.
- Extraia Side-effects para hooks (`use*`) e teste os pure helpers separadamente.

## Guia rápido de refatoração

- Favor PRs pequenos: uma mudança de responsabilidade por PR.
- Ao extrair código, escreva testes unitários para a função/hook/serviço.
- Garanta compatibilidade com RSC: mova chamadas que retornam dados para componentes servidor (Server Components) e mantenha a interação no cliente.

## PR Checklist (componentes)

- [ ] Arquivo ≤ 150 linhas
- [ ] Reutilização via hook/componente extraído quando aplicável
- [ ] `className` recebido e repassado
- [ ] `cn()` usado para classes
- [ ] Lógica de serviço movida para `server/services` ou `lib/`
- [ ] Testes e lint passing localmente

## Checklist before committing a component

- [ ] File is ≤ 150 lines
- [ ] No repeated JSX blocks
- [ ] All interactive elements have `aria-label` or visible text
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] `cn()` used for all className merging
- [ ] Zero commented-out code
