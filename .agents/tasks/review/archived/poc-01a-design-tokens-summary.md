# poc-01a-design-tokens — Archived

**Original title:** [Design System] Sub-task A — Visual Tokens

## What was done
CSS custom properties using HSL channel format defined in `app/globals.css` for both light and dark themes. Token set includes: `--color-bg-base`, `--color-bg-surface`, `--color-bg-elevated`, `--color-border-subtle`, `--color-border-default`, `--color-text-primary/secondary/muted`, `--color-brand-accent`, `--color-brand-lime`, `--color-state-error/success/warning`. Tailwind config wraps all tokens with `hsl(var(...))`. Figma token metadata captured in `.agents/design-system.meta.json`.

## Relevant paths
- `app/globals.css`
- `tailwind.config.ts`
- `.agents/design-system.meta.json`
