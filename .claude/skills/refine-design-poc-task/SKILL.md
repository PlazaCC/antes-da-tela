---
name: refine-design-poc-task
description: >-
  Use when the last POC task has been implemented and the UI needs to be
  validated and aligned against the Figma source of truth. Triggers: after
  /poc-next-task completes, before committing a feature branch, when design
  tokens or components in code diverge from Figma specs, or when a task
  checklist has unchecked design items.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, mcp__Framelink_Figma_MCP__get_figma_data, mcp__Framelink_Figma_MCP__download_figma_images, mcp__claude_ai_Plaza_MCP__plaza_update_task_status
---

# POC Design Refinement

## Objective

Compare the implemented UI against the Figma source of truth, fix token/component
divergences, and update task checklists. Never commit or push — leave that to the developer.

---

## Step 1 — Load context

Read in this order:

```
.agents/poc-context.json          ← execution_order, task statuses
.agents/figma.meta.json           ← fileKey, page nodeIds, component map
.agents/design-system.meta.json   ← current tokens, components registry
.agents/design-system.plan.md     ← implementation strategy
```

Determine **target task**:
- If `task_id` was provided (e.g. `poc-04`), use it.
- Otherwise, find the last task with `status: in_progress` or `status: pending`
  in `poc-context.json`'s `execution_order`. Prefer the highest number.

Read the target task file from `.agents/tasks/` (e.g. `poc-04-upload.md`).

---

## Step 2 — Extract design references from the task

From the task file collect:
- **Figma node IDs** (listed in the design reference table)
- **Component names** used (`DragZone`, `Tag`, `Progress`, `Button`, etc.)
- **Design tokens** referenced (`bg-surface`, `bg-brand-accent`, `border-subtle`, etc.)

Map each component name to its `figmaNodeId` using `.agents/figma.meta.json`'s
`components` field. If a component is missing from the meta, note it.

---

## Step 3 — Fetch Figma data

Call `mcp__Framelink_Figma_MCP__get_figma_data` with:
- `fileKey`: value from `.agents/figma.meta.json` (`iUb8odefGSZiHz4KjuzX1M`)
- `nodeId`: fetch only the nodes referenced by the task (not the entire file)

Fetch the relevant frames (e.g. `115:1008`, `115:1075`, `125:1430`) and the
`Foundations` page (`0:1`) for tokens.

If FrameLink returns a permission error, stop and ask the user for the Figma token.
Do not guess or use incomplete data.

---

## Step 4 — Compare: code vs Figma

### Tokens
For each token used in code, verify against Figma extracted values:

| Check | Pass condition |
|-------|---------------|
| Color hex matches | Figma fill hex = CSS variable value in `globals.css` |
| Token name matches | Tailwind config key maps to same CSS variable |
| No duplicate tokens | Two different keys don't resolve to the same color |

Divergences to flag:
- Token present in code but missing in Figma
- Token value differs (e.g. code uses `hsl(15 79% 55%)` but Figma shows `#E06030`)
- Token key renamed in Figma but old name still in code

### Components
For each component in the task scope, verify:
- Correct variant/props used (e.g. `DragZone` hover state matches Figma hover style)
- Border radius, spacing, and color classes match the Figma frame
- Typography classes match Figma text styles (`font-display`, `font-mono`, sizes)

### Assets
- SVG icons or images referenced in Figma but missing from `components/ui/` → flag

---

## Step 5 — Apply or report (dry-run gate)

**Default mode is dry-run.** Only write files if the user explicitly says
`apply_changes: true` and `dry_run: false`.

### Dry-run (default)
Output a structured diff report (see Step 7). Do not write any files.

### Apply mode (`apply_changes: true`, `dry_run: false`)
Fix divergences in this order:
1. Update `tailwind.config.ts` or `globals.css` for token corrections.
2. Update `components/ui/*.tsx` for component prop or style fixes.
3. Update `.agents/design-system.meta.json` — correct `figmaNodeId` fields,
   mark items as `component` vs `asset`, resolve duplicate token entries.
4. Update `.agents/design-system.plan.md` if strategy changed.
5. Mark verified acceptance items in the task file `.agents/tasks/<task>.md`
   by replacing `- [ ]` with `- [x]` for items that now pass.

Make minimal changes — do not rewrite sections unrelated to the divergences found.

---

## Step 6 — Validate after apply

If changes were applied, run:

```bash
yarn build    # must pass with zero errors
yarn lint     # must pass with zero warnings
```

Fix any regressions before delivering the report.

---

## Step 7 — Deliver report

```
## Design Refinement — Task [XX] <Task Name>

### Figma nodes consulted
- <nodeId>: <frame name>
- ...

### Divergences found
| Item | Code | Figma | Severity |
|------|------|-------|----------|
| <token/component> | <current value> | <expected value> | high/med/low |

### Changes applied / proposed
- `<file>`: <what changed and why>
- ...

### Checklist items updated
- [x] <acceptance item now passing>
- [ ] <item still pending — reason>

### Suggested commit (if apply_changes=true)
\`\`\`
fix(ui): align <task scope> design tokens with Figma

<one-line reason — e.g. border-subtle value diverged from Figma Foundations>
\`\`\`

### Next steps
<any remaining items or risks>
```

---

## Constraints

- **Never commit, push, or stage files.** Leave that to the developer.
- **Never write to `drizzle/` migration files.**
- **Stop immediately** if FrameLink returns a permission error — do not use
  partial or cached Figma data.
- Tailwind v3 only — do not introduce v4 syntax.
- CSS variable values must stay in `hsl(<H> <S%> <L%>)` channel format
  (no `hsl()` wrapper in the variable value itself).
- Token changes in `tailwind.config.ts` must also be reflected in `globals.css`
  CSS variables and vice versa.
- All output (code, comments, docs, report) in English.
