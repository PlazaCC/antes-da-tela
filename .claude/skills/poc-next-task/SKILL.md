---
name: poc-next-task
description: >-
  Determines the current POC state, verifies the previous task's acceptance
  criteria are fully met, and executes the next task end-to-end. Never skips
  ahead — each task's checklist must pass before the next begins.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# POC — Next Task Executor

## Objective

Determine the current POC state, verify the previous task is complete, and execute the next task.
Never skip ahead — each task's acceptance criteria must pass before the next begins.

---

## Step 1 — Read the execution order

Read `.agents/tasks/poc-overview.md` to understand:
- The mandatory execution order (`[01]` → `[07]`)
- The dependency rules (what blocks what)
- The validation commands for each task

---

## Step 2 — Determine current state

Run the following to map the repo state:

```bash
git branch -a
git log --oneline -10
git stash list
```

Then cross-reference with the execution order:
- Which branches exist? (`feat/design-system`, `feat/db-schema`, etc.)
- Which branches are already merged into `main`?
- Which task is currently in progress (open branch, uncommitted work)?

Task → branch mapping:

| Task | Branch |
|------|--------|
| [01] Design System | `feat/design-system` |
| [02] DB Schema     | `feat/db-schema` |
| [03] Auth          | `feat/auth` |
| [04] Upload        | `feat/upload` |
| [05] Leitor PDF    | `feat/reader` |
| [06] Home          | `feat/home` |
| [07] Perfil        | `feat/profile` |

---

## Step 3 — Verify the previous task's acceptance criteria

Read the task file for the **last completed or in-progress task** from `.agents/tasks/`:

| Task | File |
|------|------|
| [01] Design System | `.agents/tasks/poc-01-design-system.md` |
| [02] DB Schema     | `.agents/tasks/poc-02-db-schema.md` |
| [03] Auth          | `.agents/tasks/poc-03-auth.md` |
| [04] Upload        | `.agents/tasks/poc-04-upload.md` |
| [05] Leitor PDF    | `.agents/tasks/poc-05-leitor.md` |
| [06] Home          | `.agents/tasks/poc-06-home.md` |
| [07] Perfil        | `.agents/tasks/poc-07-perfil.md` |

Check every item in that task's **Checklist de aceite / Acceptance Criteria**:
- Run `yarn build` — must produce zero TypeScript errors.
- Run `yarn lint` — must produce zero ESLint warnings.
- Verify git state: branch merged into `main`, no uncommitted changes.
- Run `yarn drizzle-kit generate` if the task touched `server/db/schema.ts`.

**If any criterion is NOT met:** fix the gap first. Do not proceed to the next task until this step is clean.

---

## Step 4 — Identify and read the next task

Dependency graph:

```
[01] merged into main  →  unblocks [02]
[02] merged into main  →  unblocks [03] and [04] (parallel)
[03] + [04] merged     →  unblocks [05], [06], [07]
```

Identify the next task according to this order and read its full spec file from `.agents/tasks/`.

---

## Step 5 — Execute the next task

Follow every step in the task file exactly as written:
1. Create or check out the feature branch specified in the task.
2. Implement all required files, components, routes, schemas, and configurations.
3. Run the validation commands listed in the task (`yarn build`, `yarn lint`, `yarn drizzle-kit generate` when applicable).
4. Fix all errors before declaring the task complete.

---

## Step 6 — Final gate

Before closing, confirm every item in the next task's acceptance checklist:

- [ ] `yarn build` passes with zero errors
- [ ] `yarn lint` passes with zero warnings
- [ ] All specified files exist and match the expected structure
- [ ] Branch is ready to merge (per task instructions)

---

## Step 7 — Report and commit suggestion

**Never commit.** Do not run `git add`, `git commit`, or `git push` under any circumstance.

Instead, output a structured closing report:

### Report format

```
## Task [XX] — <Task Name> complete

### What was done
- <concise bullet per file or feature implemented>
- ...

### Acceptance criteria
- [x] yarn build passes with zero errors
- [x] yarn lint passes with zero warnings
- [x] <other criteria from the checklist>

### Suggested commit
\`\`\`
<type>(<scope>): <short description>

<optional body — what and why, not how>
\`\`\`

### Next task
[XX+1] <Task Name> — <one-line description of what it unlocks>
```

**Conventional commit guidance:**

| Situation | type |
|-----------|------|
| New feature / page / route | `feat` |
| Bug fix or correction | `fix` |
| DB schema / migration | `feat(db)` |
| Auth flow | `feat(auth)` |
| tRPC router | `feat(api)` |
| UI component | `feat(ui)` |
| Config / tooling | `chore` |
| Refactor without behaviour change | `refactor` |

Scope = the task area (e.g. `upload`, `reader`, `home`, `profile`, `auth`, `db`).

---

## Constraints

- **Never commit, push, or stage files** — always leave that to the developer.
- Never use `npm install` — always `yarn add`.
- Tailwind v3 only — do not use v4 syntax.
- Use `cn()` from `@/lib/utils` for all className composition.
- `createServerClient` in Server Components, `createBrowserClient` in Client Components.
- Schema source of truth: `server/db/schema.ts` — never edit generated migration files directly.
- All output (code, comments, docs) in English.
