# Component Rules

## File length

- Target: **≤ 100 lines** per file.
- Hard limit: **150 lines**. Files beyond this must be split.
- Exception: files that are purely data (long class lists, lookup tables) may exceed the limit with a comment explaining why.

## When to extract

Extract a sub-component when any of these are true:
- A JSX block repeats more than once (even with different props).
- A logical section has its own state or side-effects.
- A named concept is emerging (e.g. `RatingBox`, `PdfControls`, `OwnerActions`).
- A render branch (if/else) produces > 15 lines each side.

Extract a custom hook when:
- Multiple `useState` + `useEffect` blocks serve a single concern (e.g. `useAudio`, `useProgressScrubber`).
- The same stateful logic is needed in two or more components.

## File naming and placement

- Components: `components/<domain>/<component-name>.tsx` (kebab-case filenames).
- Hooks: `lib/hooks/use-<name>.ts`.
- Sub-components used only by one parent: same directory as the parent.
- Shared primitives: `components/ui/` via shadcn CLI only — never create files there manually.

## Naming conventions

- Components: `PascalCase` named export, no default exports.
- Hooks: `camelCase` named export prefixed with `use`.
- Props interfaces: `<ComponentName>Props` or inline when trivial (≤ 3 props).
- Accept and forward `className` on every wrapper component; merge with `cn()`.

## Composition rules

- Prefer flat component trees. Avoid deeply nested JSX (> 4 levels) — extract.
- Use `asChild` (Radix `Slot`) to compose without extra DOM nodes.
- Keep conditional rendering simple: a ternary is fine; nested ternaries → extract.
- No commented-out code, no TODOs left in committed files.

## Comments

- Write zero comments by default.
- A comment is warranted only for non-obvious WHY: hidden constraint, browser quirk, workaround.
- Never describe WHAT the code does — names already do that.
