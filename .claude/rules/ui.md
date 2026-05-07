---
name: ui
description: Rules and conventions for shadcn/ui and Tailwind in this project.
---

# UI Rules — shadcn/ui + Tailwind CSS v3

## shadcn/ui — PRIMARY component system

> **Always check `components/ui/` before building any UI element.** If a shadcn primitive exists, use it.

### Installing — official CLI only (no exceptions)

```bash
yarn dlx shadcn@latest add <component>   # e.g. dialog, table, form, select, button
```

- `components/ui/` is **read-only** — managed exclusively by the shadcn CLI and registry.
- **Never** create, copy, or manually edit files inside `components/ui/`.

### Customising — wrapper pattern

When you need app-specific behavior, create a wrapper in `components/<feature>/`:

```tsx
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function ConfirmDialog({ className, ...props }) {
  return (
    <Dialog>
      <DialogContent className={cn(className)} {...props} />
    </Dialog>
  )
}
```

- Accept and forward `className` on every wrapper.
- Use `cn()` from `@/lib/utils` — never string-concatenate classes.
- Use `asChild` (Radix `Slot`) to compose without extra DOM nodes.

**Skill:** invoke `/shadcn` or read `.agents/skills/new-shadcn-component/SKILL.md` for the full workflow.

---

## Tailwind CSS v3

- Do **not** use v4 syntax (`@import "tailwindcss"` or `@theme` blocks).
- Use design tokens from `tailwind.config.ts` — no hardcoded hex values.
- Dark mode via `next-themes` `class` strategy (already configured).
- Animations from `tailwindcss-animate` are available.

---

## Component Conventions

- `"use client"` at the top for any component using hooks or event handlers.
- Prefer named exports over default exports.
- Extend HTML props with `React.ComponentProps<"element">`.
- Keep components under ~100 lines — extract sub-components when needed.

## DRY e Modularização na UI

- Prefira wrappers que encapsulem comportamento e estilização ao invés de copiar grandes trechos de JSX.
- Extraia hooks para comportamento (ex.: `useDialog`, `useAudio`) e componentes puros para renderização.
- Centralize tokens visuais e classes utilitárias em `lib/utils` ou `design-tokens.ts`.
- Quando componentes crescerem, separe em `components/<domain>/` com subcomponentes e hooks locais.

## Quando refatorar

- Refaça quando encontrar o mesmo padrão de markup/estilos em ≥2 lugares.
- Se condicional de renderização tiver mais de uma ramificação com >15 linhas, extraia subcomponentes.
