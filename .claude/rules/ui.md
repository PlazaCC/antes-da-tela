---
paths:
  - "components/**"
  - "app/**/*.tsx"
---

# UI Rules — shadcn/ui + Tailwind CSS v3

## shadcn/ui
- Add new components with: `yarn dlx shadcn@latest add <component>`.
- Never edit files inside `components/ui/` directly — they are managed by shadcn.
- Build feature/page components in `components/<feature>/` using primitives from `components/ui/`.
- Use the `asChild` prop (via Radix `Slot`) to compose primitives without extra DOM nodes.

## Utility Function
- Always merge class names using `cn()` from `@/lib/utils` — it wraps `clsx` + `tailwind-merge`.
  ```ts
  import { cn } from "@/lib/utils"
  className={cn("base-styles", conditionalStyle && "extra", className)}
  ```

## Tailwind CSS v3
- Do **not** use Tailwind v4 syntax (`@import "tailwindcss"` or `@theme` blocks).
- Use existing design tokens from `tailwind.config.ts` — do not hardcode hex values.
- Dark mode: controlled by `next-themes` via `class` strategy already configured.
- Animation utilities from `tailwindcss-animate` are available (e.g., `animate-accordion-down`).
- `tailwind-merge` is in the stack — always use `cn()`, never string concatenate class names.

## Component Conventions
- Client Components that use hooks or events: add `"use client"` at the top.
- Keep components small and focused — extract sub-components if a component exceeds ~100 lines.
- Use `React.ComponentProps<"element">` for extending base HTML props.
- Prefer named exports over default exports for components.

## Accessibility
- Use Radix UI dialog, dropdown, and menu primitives — they handle keyboard navigation and ARIA automatically.
- Add `aria-label` to icon-only buttons.
- Form labels: always associate with inputs via shadcn `Label` + `htmlFor`.
