---
name: create-poc-task
description: Analyzes current POC task state, creates a standardized new task file, and updates poc-context.json and summary.md. Use when adding a new task to the Antes da Tela POC backlog.
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep
---

# create-poc-task

## Purpose

Create a new POC task that follows the exact format of existing tasks, inserted at the correct priority position, with all related files updated automatically.

---

## When to Use

- Adding a new feature, fix, or design task to the Antes da Tela POC
- Formalizing a task that was discussed informally
- Extending Phase 2 with additional tasks beyond poc-26

---

## Inputs (gather before proceeding)

Required:
- `title` — short task title (e.g., "Script Page: redesign hero section")
- `scope` — Frontend / Backend / Full-stack
- `priority` — P0 / P1 / P2 / P3 / P4 with rationale
- `description` — what the task should achieve (1–3 sentences)

Optional (fill with "TBD" if unknown):
- `figma_nodeId` — Figma node ID for the screen (from `figma.screens` in poc-context.json)
- `key_files` — list of files to modify
- `already_done` — list of features already implemented for this screen
- `gaps` — specific gaps to address
- `mobile_specs` — phone/tablet requirements

If the user didn't provide inputs, ask for `title`, `priority`, and `description` before continuing.

---

## Step-by-Step Process

### Step 1 — Read current context

Read both files in parallel:
1. `.agents/poc-context.json` — scan `phase2_tasks[]` to find:
   - All existing IDs → derive next ID (e.g., if poc-26 is last, next is poc-27)
   - Current priorities and statuses
   - `execution_order` string
2. `.agents/tasks/summary.md` — understand current status table and screen state

### Step 2 — Determine task ID and filename

- Next ID = highest numeric suffix in `phase2_tasks[].id` + 1
- If the user explicitly provides an ID, use that
- Filename: `poc-{NN}-{title-slug}.md` (kebab-case title, max 4 words)
- Full path: `.agents/tasks/poc-{NN}-{title-slug}.md`

### Step 3 — Check Figma node

If `figma_nodeId` was provided:
- Verify it exists in `poc-context.json → figma.screens` or note it as a new screen
- If the user provided a node not in `figma.screens`, add it to poc-context.json

If no `figma_nodeId`, set **Figma:** to "TBD — define before implementation" in the task file.

### Step 4 — Generate task file

Use the template below exactly. Fill every section — do not leave sections empty.
Use the same language as existing task files: section headings and labels in Portuguese, code/identifiers in English.

```markdown
# poc-{NN} — {Title}

**Scope:** {Frontend / Backend / Full-stack}  
**Priority:** {PX}  
**Status:** pending  
**Figma:** {Screen name} `{nodeId}` ← or "TBD — define before implementation"

---

## O que já está feito ✓

{List features already implemented for this screen/area. If nothing, write "— (tela nova)"}

---

## Gaps

{For each gap, use a numbered subsection:}

### 1. {Gap title}

{Concise description of the gap.}

**Arquivo:** `{path/to/file.tsx}`

```tsx
{Code snippet or pseudocode illustrating the change — always show before/after or the target state}
```

{Add more gaps as needed, numbered sequentially.}

---

## Mobile & Tablet (Figma é desktop-only — especificação adicional)

{Figma covers 1440px only. Specify phone (<768px), tablet (768–1023px), desktop (≥1024px) requirements.}

Global rules (always include):
- Touch targets ≥44×44px on interactive elements
- `text-base` (min 16px) on all inputs to prevent iOS auto-zoom
- `min-h-dvh` instead of `min-h-screen`
- `env(safe-area-inset-bottom)` on any fixed footer element
- Never use `hover` as the only interactivity indicator

{Add screen-specific breakpoint specs below the global rules.}

---

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `{file}` | `{what changes}` |

---

## Acceptance criteria

- [ ] {Specific, verifiable criterion}
- [ ] {Another criterion}
- [ ] `yarn build` sem erros de tipo
```

### Step 5 — Determine priority insertion point

Rules for `execution_order` update:
- P0 tasks go before all P1+ tasks (blockers)
- Tasks with same priority follow existing order
- Blocked tasks append to end of their priority group
- Update the `execution_order` string in poc-context.json (format: `poc-XX ✓ → poc-YY → poc-ZZ (parallel: poc-AA)`)

### Step 6 — Update poc-context.json

Add a new entry to `phase2_tasks[]` in priority order:

```json
{
  "id": "poc-{NN}",
  "title": "{Title}",
  "status": "pending",
  "priority": "{PX}",
  "figma_nodeId": "{nodeId or omit if TBD}",
  "task_file": ".agents/tasks/poc-{NN}-{slug}.md",
  "real_scope": "{1–2 sentence scope description}",
  "already_done": ["{feature 1}", "{feature 2}"],
  "key_files": ["{path/to/file}"]
}
```

Also update `execution_order` to include the new task ID at the correct priority position.

### Step 7 — Update summary.md

1. Add a row to the **"Prioridades — tarefas pendentes"** block (maintain P0→P4 sort):
   ```
   P{X} — poc-{NN}: {Title} ({brief scope})
   ```

2. Add a row to the **"Status das tasks"** table:
   ```
   | poc-{NN} — {Title} | `poc-{NN}-{slug}.md` | **P{X}** | pending | {scope description} |
   ```

3. Add a row to **"Estado atual por tela"** table:
   ```
   | {Screen name} | {what's already done} | {what's missing (task gaps)} |
   ```

---

## Output

After completing all steps, report:

```
Task poc-{NN} created:
  File:     .agents/tasks/poc-{NN}-{slug}.md
  Priority: P{X} — {rationale}
  Status:   pending

Files updated:
  .agents/poc-context.json  (phase2_tasks + execution_order)
  .agents/tasks/summary.md  (priorities + status table + screen state)
```

---

## Hard Constraints

- Never modify existing task files — only create new ones
- Never change `status` of existing tasks in poc-context.json when creating a new one
- Task file sections must all be filled — no empty sections
- `yarn build` acceptance criterion is mandatory in every task
- Priority rationale must explain relationship to existing tasks (e.g., "blocked by poc-25")
- If inserting a P0 task, explicitly note what it blocks and why it must run first
