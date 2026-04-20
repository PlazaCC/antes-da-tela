---
name: poc-next-task
agent: agent
description: Executes the next pending POC task. Reads poc-context.json for fast context pickup — no build/lint at start. Implements the task, queries Figma MCP for design tasks, updates checklists and Plaza status.
argument-hint: '[task_id] — optional (e.g. poc-10). Omit to auto-detect the next pending/in-progress task from .agents/poc-context.json'
tools: [read, edit, write, search, 'framelink_figma_mcp/*', 'plaza.mcp/*', todo]
---

## Fast Context Pickup

**2 reads to start:**

1. Read `.agents/poc-context.json` — scan `new_tasks` + `execution_order` for target:
   - Argument provided → match `id` directly
   - `in_progress` by execution_order → resume first match
   - `pending` by execution_order → start first match
2. Read the `task_file` path from the matched entry.

**Do NOT run `yarn build` or `yarn lint` at the start.** Released code is already validated. Run builds only post-implementation when verifying acceptance items that explicitly require it.

---

## Design Source

Figma via MCP FramLink is the only source of truth. No local assets in `.agents/figma/`.

- `.agents/figma.meta.json` + `.agents/design-system.meta.json` → fallback only if MCP unavailable
- Official Figma links:
  - Main flow: `node-id=186-1388`
  - Script registration: `node-id=186-1350`
  - User profile: `node-id=186-2075`
  - File key: from `.agents/figma.meta.json`

---

## Execution Steps

1. Read task file → capture `objective`, `files_to_create/update`, component refs, acceptance items
2. For design tasks → call `mcp_framelink_fig_get_figma_data` with only the nodeIds in scope
3. Implement — minimal, focused changes to listed files only
4. Update Plaza MCP: `pending → in_progress` on start; `in_progress → done` on completion
5. Mark acceptance checklist items that are verifiably complete (`- [ ]` → `- [x]`)
6. Output commit suggestion ( `<conventional-commit>: <brief description>`) — **never run git commit/push**

---

## Build / Lint

Run `yarn build` and `yarn lint` **only** when:

- Implementation is complete
- Acceptance item explicitly states "yarn build passes" or "yarn lint passes"

---

## Hard Constraints

- `yarn add` only — never `npm install`
- Tailwind v3 — no v4 syntax; `cn()` from `@/lib/utils`
- Schema: `server/db/schema.ts` — never edit generated migrations directly
- All code, comments, commits in English
- Never write secrets to project files
- Checklist format: `- [ ]` → `- [x]` (Markdown) or `done: false` → `done: true` (JSON)
