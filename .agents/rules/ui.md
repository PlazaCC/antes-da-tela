---
paths:
  - "components/**"
  - "app/**/*.tsx"
---

# UI Rules — shadcn/ui + Tailwind CSS v3

## shadcn/ui — PRIMARY component system

> **Always use shadcn primitives first.** Check `components/ui/` before building any UI element.

### Installing components — CLI only (no exceptions)
```bash
yarn dlx shadcn@latest add <component>   # e.g. dialog, table, form, select, button
```
- `components/ui/` is **read-only** — files there are managed exclusively by the shadcn CLI and registry.
- **Never** manually create, copy, or edit files inside `components/ui/`.

### Customising — wrapper pattern
Build app-specific components in `components/<feature>/`, wrapping shadcn primitives:
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  className?: string
}

export function AppDialog({ open, onOpenChange, title, className }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(className)}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
```
Rules:
- Accept and forward `className` on every wrapper component.
- Use `cn()` from `@/lib/utils` for all class merging — never string-concatenate class names.
- Use `asChild` (Radix `Slot`) to compose without adding extra DOM nodes.

**Skill:** `.agents/skills/new-shadcn-component/SKILL.md` — full install-and-wrap workflow.

---

## Utility Function — cn()

Always merge class names with `cn()` from `@/lib/utils`:
```ts
import { cn } from "@/lib/utils"
className={cn("base-styles", condition && "extra", className)}
```

---

## Tailwind CSS v3

- **Do not** use Tailwind v4 syntax (`@import "tailwindcss"` or `@theme` blocks).
- Use design tokens from `tailwind.config.ts` — do not hardcode hex values.
- Dark mode: `next-themes` via `class` strategy (already configured).
- Animation utilities from `tailwindcss-animate` are available (e.g., `animate-accordion-down`).

### Responsividade (Mobile & Tablet)
- **Use sempre o breakpoint `md:` (768px)** como o limite superior para layouts de celular. 
- **NÃO use `sm:` (375px) para adaptações estruturais de layout mobile**, pois muitos celulares (ex: iPhone 12 Pro com 390px) e tablets cairiam nas regras para telas maiores.
- Como não há um design oficial focado unicamente em tablets, a regra é estender o comportamento "mobile-first" até o breakpoint `md:` (inclusive). Tudo a partir de `md:` deve ser considerado desktop ou um híbrido que suporte o layout atual.

---

## Component Conventions

- Client Components that use hooks or events: add `"use client"` at the top.
- Keep components focused — extract sub-components when a file exceeds ~100 lines.
- Use `React.ComponentProps<"element">` for extending base HTML props.
- Prefer named exports over default exports.

---

## Accessibility

- Radix UI primitives (dialog, dropdown, menu) handle keyboard navigation and ARIA automatically — prefer them.
- Add `aria-label` to icon-only buttons.
- Always associate form labels with inputs via shadcn `Label` + `htmlFor`.
