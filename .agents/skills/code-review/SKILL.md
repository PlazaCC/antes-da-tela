---
name: code-review
description: Use when a feature branch is complete and ready for PR — runs a full diff-based review of the current branch against main, reads every changed file, validates against project rules, and produces a concrete action plan. Do NOT use on main branch.
---

# Code Review — Branch vs Main

## Overview

Full review of current branch diff against `main`, grounded in actual file contents. No hallucination — every finding cites a file and line number.

**Core principle:** Read first, judge second. Every claim must be traceable to a real line in a real file.

**Announce at start:** "Running code-review skill — analyzing branch `<name>` vs `main`."

---

## Step 0 — Guard: Confirm Not on Main

```bash
git branch --show-current
```

If output is `main` or `master`: **STOP.** Report:

> "You are on `main`. Switch to your feature branch before running code review."

Do not continue.

---

## Step 1 — Gather the Diff

```bash
# List changed files with status
git diff --name-status main...HEAD

# Full diff (for reading patches without opening every file)
git diff main...HEAD
```

Record the file list. If empty → "No changes found vs main. Nothing to review."

---

## Step 2 — Read Every Changed File

For each file in the diff, read its **current state** using the Read tool (not just the patch). Understand context, not just the lines that changed.

Priority order:
1. New files (highest risk — no previous review)
2. Modified files in `server/`, `trpc/`, `lib/` (backend/auth logic)
3. Modified files in `app/`, `components/` (UI)
4. Config / migration files (`drizzle/`, `tailwind.config.ts`, etc.)

---

## Step 3 — Run Validators

Run all validators on the project. Use `package.json` scripts:

```bash
yarn tsc --noEmit          # Type errors
yarn lint                  # ESLint
yarn test:run              # Vitest unit tests
```

Do NOT run `yarn build` by default (slow) — only if type-check and lint pass and you suspect a bundler issue.

Capture output. Include failures verbatim in the report.

---

## Step 4 — Review Against Project Rules

Check each changed file against the applicable rules. Reference the CLAUDE.md and `.claude/rules/` for this project:

### Supabase / Auth (`.claude/rules/supabase.md`)
- `createServerClient` used in Server Components, `createBrowserClient` in Client Components
- No `SUPABASE_SERVICE_ROLE_KEY` in auth flows or client code
- No `NEXT_PUBLIC_` prefix on service role key
- No `.select('*')` when result crosses RSC → Client Component boundary
- Uploads are client-side only (Supabase Storage direct upload)
- URLs resolved server-side via `getPublicUrl()`, passed as props

### tRPC (`.claude/rules/typescript.md`, CLAUDE.md)
- `ctx.supabase` used for all data queries — no raw DB connections
- `ctx.user` only in `authenticatedProcedure`, never in `publicProcedure`
- `useTRPC()` from `@/trpc/client` in Client Components
- `trpc` / `HydrateClient` from `@/trpc/server` for RSC prefetch
- Zod schemas on all procedure inputs

### Drizzle / Migrations (`.claude/rules/drizzle.md`)
- No runtime Drizzle client (`server/db/index.ts` was removed)
- Schema changes in `server/db/schema.ts` + new migration file in `drizzle/`
- Never retroactively edit generated migration files

### Next.js App Router (`.claude/rules/nextjs.md`)
- `"use client"` only on components that use hooks or event handlers
- No `async` Server Component that waterfalls — use `Promise.all` or parallel fetches
- Dynamic imports for heavy components (`pdf.js`, etc.)
- No sensitive data serialized through RSC → Client boundary

### shadcn/ui + Tailwind (`.claude/rules/ui.md`)
- No files manually created/edited in `components/ui/`
- Wrappers in `components/<feature>/`, not `components/ui/`
- `cn()` from `@/lib/utils` — never string concatenation
- `className` forwarded on every wrapper component
- Tailwind v3 syntax only — no v4 `@import "tailwindcss"` or `@theme` blocks
- No hardcoded hex values — use design tokens from `tailwind.config.ts`

### General
- No `npm install` — always `yarn add`
- Named exports preferred over default exports
- Components under ~100 lines — extract when needed
- No comments unless WHY is non-obvious

---

## Step 5 — Write the Report

Structure the report exactly as follows. Only include sections with findings.

```
## Code Review — <branch-name> vs main
Date: <today>
Files changed: <N> (<list file names>)

---

### Validator Results
- TypeScript: ✅ PASS / ❌ FAIL (<N errors>)
- ESLint:     ✅ PASS / ❌ FAIL (<N warnings/errors>)
- Tests:      ✅ PASS / ❌ FAIL (<N failures>)

---

### Critical Issues (must fix before PR)
> Issues that will cause runtime errors, security vulnerabilities, broken auth, or data loss.

- [ ] **[FILE:LINE]** <issue> — <why it matters> — <suggested fix>

---

### Important Issues (fix before merging)
> Violations of project rules, incorrect patterns, missing validation.

- [ ] **[FILE:LINE]** <issue> — <rule violated> — <suggested fix>

---

### Minor Issues (note for later)
> Code style, naming, opportunities to simplify.

- [ ] **[FILE:LINE]** <issue> — <suggestion>

---

### Strengths
> Patterns done correctly that should be maintained.

- <positive finding with file reference>

---

### Assessment
**Ready for PR?** YES / NO — <one sentence reason>
```

---

## Anti-Hallucination Rules

- **Never** report an issue you haven't seen in an actual file read.
- **Never** reference a function, import, or variable that you haven't confirmed exists in the current diff or file.
- **Always** include `[FILE:LINE]` for every issue.
- If you're unsure whether a pattern is a problem, say "Unverified — needs human review at [FILE:LINE]."
- Do not invent rules not present in CLAUDE.md or `.claude/rules/`.

---

## Quick Reference

| Check | Command |
|-------|---------|
| Current branch | `git branch --show-current` |
| Changed files | `git diff --name-status main...HEAD` |
| Full diff | `git diff main...HEAD` |
| Type check | `yarn tsc --noEmit` |
| Lint | `yarn lint` |
| Tests | `yarn test:run` |

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Reporting issues from memory, not file reads | Read every changed file before writing the report |
| Skipping validator output | Always run all three validators and include output |
| Vague issues without file reference | Every finding must include `[FILE:LINE]` |
| Reviewing main branch | Guard at Step 0 — stop immediately |
| Missing new files | New files have no prior review — read them carefully |
| Over-reporting style nits as Critical | Reserve Critical for runtime/security issues only |

---

## Integration

**Called before:** `finishing-a-development-branch` — run code-review, fix issues, then create PR.

**After completing review:** If issues found, fix them in the branch, then re-run this skill to confirm no regressions before creating the PR.
