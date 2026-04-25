---
name: create-poc-task
description: Analyzes current POC task state, creates a standardized new task file, and updates poc-context.json and summary.md. Use when adding a new task to the Antes da Tela POC backlog.
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep
---

# create-poc-task

## Purpose

Create a standardized task file for the Antes da Tela POC, inserted at the correct priority position, with all related files updated.

---

## Inputs

Required:
- `title` — task title
- `scope` — Frontend / Backend / Full-stack
- `priority` — P0–P4
- `description` — what should be achieved (1–3 sentences)

Optional:
- `figma_nodeId`, `key_files`, `already_done`, `gaps`, `mobile_specs`

If inputs are missing, ask for `title`, `priority`, and `description` before continuing.

---

## Process

### 1. Read context (parallel reads)

- `.agents/poc-context.json` → `phase2_tasks[]`: existing IDs, statuses, `execution_order`
- `.agents/tasks/summary.md` → current status table

### 2. Determine task ID and filename

- Next ID = max numeric suffix in `phase2_tasks[].id` + 1 (or use user-provided ID)
- Filename: `.agents/tasks/poc-{NN}-{title-slug}.md`

### 3. Create task file

Use the standard template (see below). All sections required.

```markdown
# poc-{NN} — {Title}

**Scope:** {scope}  
**Priority:** {PX}  
**Status:** pending  
**Figma:** {screen} `{nodeId}`

---

## O que já está feito ✓

- {item}

---

## Gaps

### 1. {Gap title}

{Description + code snippet}

---

## Mobile & Tablet (Figma é desktop-only — especificação adicional)

{Phone/tablet/desktop specs. Always include global rules:}
- Touch targets ≥44×44px
- `text-base` (16px min) on all inputs
- `min-h-dvh` instead of `min-h-screen`
- `env(safe-area-inset-bottom)` on fixed footer elements
- Never `hover`-only interactivity indicator

---

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `{file}` | `{change}` |

---

## Acceptance criteria

- [ ] {criterion}
- [ ] `yarn build` sem erros de tipo
```

### 4. Update poc-context.json

Insert new entry into `phase2_tasks[]` in priority order (P0 before P1 before P2...):

```json
{
  "id": "poc-{NN}",
  "title": "{Title}",
  "status": "pending",
  "priority": "{PX}",
  "figma_nodeId": "{nodeId}",
  "task_file": ".agents/tasks/poc-{NN}-{slug}.md",
  "real_scope": "{scope description}",
  "already_done": [],
  "key_files": []
}
```

Update `execution_order` to include the new task at the correct priority position.

### 5. Update summary.md

1. Add to **"Prioridades — tarefas pendentes"** block (P0→P4 order)
2. Add row to **"Status das tasks"** table
3. Add row to **"Estado atual por tela"** table

---

## Hard Constraints

- Never modify existing task files
- Never change status of existing tasks when creating a new one
- All task file sections must be filled — no empty sections
- `yarn build` acceptance criterion is mandatory
- Priority rationale must explain relationship to existing tasks
