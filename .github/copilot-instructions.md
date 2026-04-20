# GitHub Copilot Instructions

This repository uses `AGENTS.md` as the main agent guidance source. Follow the same rules when working here.

---

## shadcn/ui — UI component system (read this before writing any UI)

**This project uses shadcn/ui as its primary component library. Always check `components/ui/` before building anything new.**

### Installing components — official CLI only
```bash
yarn dlx shadcn@latest add <component>   # e.g. dialog, table, form, select, button
```
- **Never** create files manually inside `components/ui/` — that directory is exclusively managed by the shadcn CLI and registry.
- **Never** edit files inside `components/ui/` directly.

### Customising — wrapper pattern
When you need app-specific behavior, create a wrapper in `components/<feature>/`:
```tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LoadingButton({ isLoading, className, children, ...props }) {
  return (
    <Button className={cn(className)} disabled={isLoading} {...props}>
      {isLoading ? "Loading…" : children}
    </Button>
  )
}
```
Rules:
- Accept and forward `className` on every wrapper.
- Use `cn()` from `@/lib/utils` for all class merging (`clsx` + `tailwind-merge`).
- Use `asChild` (Radix `Slot`) to compose primitives without extra DOM nodes.

**Skill reference:** `.agents/skills/new-shadcn-component/SKILL.md` — full install-and-wrap workflow.

---

## Key guidance

- Use Yarn 4 with `corepack enable`; do not run `npm install`.
- Start development with `yarn dev`; verify changes with `yarn lint` / `yarn test`.
- Tailwind v3 only — do not use v4 syntax (`@import "tailwindcss"` or `@theme`).
- For Supabase and migrations: follow `AGENTS.md` and `.agents/rules/supabase.md`.
- For tRPC work: prefer `trpc/init.ts`, `trpc/client.tsx`, and `server/api/root.ts`.

---

## Useful docs

- [`AGENTS.md`](../AGENTS.md) — agent entrypoint
- [`CLAUDE.md`](../CLAUDE.md) — architecture, commands, critical patterns
- [`docs/SETUP.md`](../docs/SETUP.md) — environment setup
- [`.agents/rules/supabase.md`](../.agents/rules/supabase.md) — Supabase auth + DB patterns
- [`.agents/rules/ui.md`](../.agents/rules/ui.md) — shadcn/ui + Tailwind rules
- [`.agents/skills/new-shadcn-component/SKILL.md`](../.agents/skills/new-shadcn-component/SKILL.md) — install and wrap shadcn components
