# AGENTS.md — Guidance for AI coding agents

Purpose: short, actionable guidance for AI coding agents working in this repository.

**Start here**

- **Read:** [CLAUDE.md](CLAUDE.md) — high-level architecture, commands, and conventions.
- **Run (local dev):** `yarn dev` (see CLAUDE.md → Common Commands).
- **Inspect rules:** `.agents/rules/` contains path-scoped conventions (Supabase, UI, Drizzle).

**Core behaviors**

- Preserve repository style and minimal scope of changes.
- Use `apply_patch` (or equivalent) for edits; avoid manual large-file copy/pastes.
- For any multi-step task, create a tracked TODO via the `manage_todo_list` tool.
- **Automatic Quality Gate:** Pre-commit hook `.husky/pre-commit` runs automatically on `git commit`:
  1. `yarn type-check` — validates TypeScript
  2. `yarn lint` — validates code style
  - If ANY check fails, commit is aborted. Fix errors and retry.
  - Skill sync stays manual via `yarn skills` when `.agents/skills/` changes.
- **Database Safety:** If any migration or database command fails, STOP and ask for manual verification. Do NOT attempt alternative workarounds. See `.agents/rules/supabase.md`.
- Read relevant SKILL.md files before acting. Example: [.agents/skills/writing-skills/SKILL.md](.agents/skills/writing-skills/SKILL.md).

**Project-specific conventions (high-value links)**

- **Migrations:** Drizzle for schema migrations (`yarn db:generate`, `yarn db:migrate`), Supabase CLI for custom/RLS migrations. See [CLAUDE.md](CLAUDE.md) and `.agents/rules/supabase.md`.
- **shadcn/ui & Tailwind (read before any UI work):** [.agents/rules/ui.md](.agents/rules/ui.md)
- shadcn install-and-wrap skill: [.agents/skills/new-shadcn-component/SKILL.md](.agents/skills/new-shadcn-component/SKILL.md)
- Setup and scripts: [docs/SETUP.md](docs/SETUP.md) and [package.json](package.json)

**Quick local commands**

- `yarn dev` — start dev server
- `yarn build` — production build
- `yarn lint` — ESLint
- `yarn test` / `yarn test:run` — run Vitest
- `yarn type-check` — Type check (tsc)
- `yarn drizzle-kit generate` — generate Drizzle SQL migrations
- `yarn drizzle-kit migrate` — apply migrations to Supabase
- `yarn dlx shadcn@latest add <component>` — install new shadcn/ui components
- `yarn skills` — sync agent skills to detected targets
- `yarn skills:force` — rebuild synced agent skills from scratch

**Key project patterns**

- Use Yarn 4 with `corepack enable`; do not use `npm install`.
- **For UI work:** always install with `yarn dlx shadcn@latest add <component>`. Never create or edit files under `components/ui/` — build wrappers in `components/<feature>/` instead. See [.agents/skills/new-shadcn-component/SKILL.md](.agents/skills/new-shadcn-component/SKILL.md).
- For Supabase auth/data, follow `CLAUDE.md` and `.agents/rules/supabase.md`.
- For tRPC and API work, prefer `trpc/init.ts`, `trpc/client.tsx`, and `server/api/root.ts` as the authoritative flow.

**When to create or update skills vs. CLAUDE.md**

- Put broad, reusable agent rules in a `SKILL.md` under `.agents/skills/`.
- Put project-scoped conventions and quick-start notes in `CLAUDE.md`.
- Prefer updating `AGENTS.md` over creating `.github/copilot-instructions.md` unless GitHub-specific policies are required.

**Checklist before edits**

1. Read `CLAUDE.md` and the relevant `.agents/rules/*` file.
2. Run linters/tests locally if available (`yarn lint`, `yarn test`).
3. Make minimal edits; use `apply_patch` to change files.
4. **After finishing:** Run `yarn lint`, `yarn test:run`, and `yarn type-check`. Only if these pass, run `yarn build`.
5. Update TODOs via `manage_todo_list` and report changed files.

**If unsure**: leave a concise inline comment in the code/PR and ask for clarification.

---

This file is intentionally minimal — link to existing docs instead of copying them.

Knowledge graph available at `graphify-out/` — use `/graphify` when needed for deep architecture analysis.
