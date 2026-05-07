---
name: poc-next-task
description: Identifies and executes the next pending POC task. Fast context pickup from poc-context.json — no build/lint at start. Use for starting the next task, resuming in-progress work, or targeting a specific task by ID.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# poc-next-task

## Fast Context Pickup

**2 reads max to identify the target:**

1. Read `.agents/poc-context.json` — scan `new_tasks` + `execution_order`:
   - Argument provided (e.g. `poc-10`) → match `id` directly
   - `in_progress` tasks by execution_order step → resume first match
   - `pending` tasks by execution_order step → start first match
2. Read the `task_file` path from the matched task entry.

For a quick human-readable summary, also consult `.agents/tasks/summary.md`.

**Never run `yarn build` or `yarn lint` at task start.** Released code is already validated. Builds run only post-implementation when an acceptance item explicitly requires it.

---

## Design Source

Figma via MCP FramLink is the only source of truth.

- `.agents/figma.meta.json` + `.agents/design-system.meta.json` → fallback only if MCP unavailable
- No local assets in `.agents/figma/` — always use MCP
- Official Figma links (file key from `figma.meta.json`):
  - Main flow: `node-id=186-1388`
  - Script registration: `node-id=186-1350`
  - User profile: `node-id=186-2075`

---

## Execution

1. Read task file — capture `objective`, `files_to_create/update`, component refs, acceptance items
2. For design tasks → call `mcp_framelink_fig_get_figma_data` with only the nodeIds in scope
3. Implement — minimal, focused changes to listed files only
4. Update Plaza MCP: `pending → in_progress` on start; `in_progress → done` on completion
5. Mark acceptance items verifiably complete (`- [ ]` → `- [x]`)
6. Output commit suggestion — **never run `git commit` or `git push`**

Commit format: `<conventional-commit>: <brief description>`

---

## Build / Lint

Run `yarn build` and `yarn lint` **only** when:

- Implementation is complete
- An acceptance item explicitly states "yarn build passes" or "yarn lint passes"

---

## Hard Constraints

- `yarn add` only — never `npm install`
- Tailwind v3 — no v4 syntax; `cn()` from `@/lib/utils`
- Schema source: `server/db/schema.ts` — never edit generated migrations directly
- All output (code, comments, commits) in English
- Never write secrets to project files
- `createServerClient` in Server Components; `createBrowserClient` in Client Components
