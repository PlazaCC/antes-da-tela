---
name: poc-refine-design
description: Use when a POC task has been implemented and needs design alignment with Figma — tokens diverge, components are mismatched, or the design-system metadata is stale. Triggers: post-implementation review, design QA pass, or when `.agents/design-system.meta.json` may be out of sync with the Figma source.
---

# poc-refine-design

Align the last completed (or in-progress) POC task with the Figma design source. **Always use the Figma via MCP FramLink as the primary source for tokens, components, and layouts.**

- The `.agents/figma.meta.json` and `.agents/design-system.meta.json` files are only fallback/support.
- There are no more local assets in `.agents/figma/` — ignore any mention of local SVG/PNG/PDF assets.
- Official Figma links for reference:
  - Main flow: https://www.figma.com/design/iUb8odefGSZiHz4KjuzX1M/Antes-da-Tela-%E2%80%94-Design-System?node-id=186-1388
  - Script registration: https://www.figma.com/design/iUb8odefGSZiHz4KjuzX1M/Antes-da-Tela-%E2%80%94-Design-System?node-id=186-1350
  - User profile: https://www.figma.com/design/iUb8odefGSZiHz4KjuzX1M/Antes-da-Tela-%E2%80%94-Design-System?node-id=186-2075

## Workflow

### 0. Safety & Regression Checks — Verify Recent Tasks First

Read the recent task history before making any changes:

- Inspect `.agents/tasks/` and collect the last N completed or modified tasks (default N=3). Use `execution_order`, `completed_at`, or git history to order.
- For each recent task capture: `id`, `status`, `execution_order`, `completed_at`, and any layout snapshots (e.g. `.agents/tasks/<id>/layout/*.png`).
- If any recent task modified layout, interaction flow, or security-sensitive UI (auth, confirmation dialogs, role-based UI), mark it as a regression-sensitive change and include it in the comparison set.
- If regression-sensitive changes are found, run layout diffs (image diff or DOM/class diff) against the candidate task before applying updates. If diffs indicate regressions, escalate for manual review (do not apply breaking changes automatically).

### 1. Load Context

Read in order:

- `.agents/poc-context.json` — execution order, task list, token format
- `.agents/tasks/<task-file>.md` — acceptance checklist, component references
- `.agents/figma.meta.json` — `fileKey`, page/component nodeId map
- `.agents/design-system.meta.json` — current tokens, component registry
- `.agents/design-system.plan.md` — strategy and priorities

**Always call `mcp_framelink_fig_get_figma_data` to fetch node JSON or rendered assets.** Only use local metadata files if MCP is unavailable.

### 2. Determine Target Task (with regression context)

Pick the last task with `status` in `["in_progress", "pending"]` ordered by `execution_order` (highest number wins, e.g. `poc-07` > `poc-06`). However:

- Prefer a task that does not have an unresolved regression-sensitive flag from step 0.
- If the latest task is regression-sensitive, include the previous N tasks in the validation set and treat the update as "requires manual review" unless the regression audit passes.

### 3. Extract Design References (including layout snapshots)

From the task file, collect:

- Component names (e.g. `StarRating`, `RatingBox`, `Avatar`, `ScriptCard`)
- Figma nodeIds referenced
- Token names used
- Layout snapshots or screenshot paths for visual diffing
- Local export paths (if present): component SVG filenames under `.agents/figma/components/`, screen exports under `.agents/figma/screens/`, and frame exports under `.agents/figma/frames/` — use these for fast comparisons and visual diffs.

### 4. Query Figma via FramLink MCP

```
mcp_framelink_fig_get_figma_data(fileKey, nodeIds)
```

Use `figma.meta.json.components` only as a fallback to map component names → nodeIds. **Always request only nodes relevant to the task from MCP.**

If the MCP call fails with a permissions error → **stop and ask the user for the Figma token**. Do not write partial data.

### 5. Compare (tokens, components, typography, layout/regressions)

| What                     | How                                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Colors**               | Hex/HSL in `design-system.meta.json` vs Figma. Flag duplicates and divergences.                                                                                                                  |
| **Typography**           | Scale entries in meta vs Figma text styles. Note missing entries.                                                                                                                                |
| **Components**           | For each task component: verify `figmaNodeId` and `type` (`component` vs `asset`) in meta.                                                                                                       |
| **Token format**         | If `poc-context.json.tokens_format` is `hsl`, convert all hex → HSL channels before comparing.                                                                                                   |
| **Layout / Regressions** | Compare rendered frames or layout snapshots across the current task and the last N tasks. Report pixel/DOM/class diffs and highlight changes that remove affordances or alter critical UI flows. |

Include a `regression_audit` object in memory with the tasks compared and a `risk` level (`none`, `low`, `medium`, `high`).

### 6. Apply Corrections (safely, with regression gating)

- Consolidate tokens that share the same value under different names.
- Correct `type` field: distinguish `component` (interactive, reusable) from `asset` (image/SVG).
- Before writing updates to `.agents/design-system.meta.json`, run the regression audit:
  - If `risk` is `none` or `low`, proceed with minimal corrections and annotate changes with `regression_audit: {status: "auto-applied", compared_tasks: [...], risk: "low"}`.
  - If `risk` is `medium` or `high`, save proposed changes as a draft (`.agents/design-system.meta.json.draft`) and require a manual review step. Do not overwrite production meta automatically.
- Write all safe corrections to `.agents/design-system.meta.json`.
- If strategy changes, update `.agents/design-system.plan.md`.

Make minimal changes — do not rewrite sections unrelated to the task.

### 7. Update Task Checklist

Mark acceptance items in `.agents/tasks/<task-file>.md` as completed for items verifiably checked in this run. Add a checklist entry for `Regression audit` with status `passed` or `requires_review`.

### 8. Deliver Report

```
Task processed:           <task-id>
Figma nodes queried:     [list]
Tasks compared:          [last_N_task_ids]
Regression audit:        { status: passed|failed|requires_review, risk: none|low|medium|high }
Changes applied:
  - file: <path>
    change: <brief description>
Draft saved:             <path> (if manual review required)
Checklist updated:       [items marked done]
Next steps / risks:      <1-2 sentences>
Commit suggestion:       feat(design): <message>
```

## Operational Rules

- **Always prioritize Figma via MCP FramLink.**
- Ignore any instruction to look for local assets in `.agents/figma/`.
- Local files `.agents/figma.meta.json` and `.agents/design-system.meta.json` are fallback only.
- Never write tokens or secrets to project files.
- Minimal, focused changes only; do not rewrite unrelated sections.
- Never auto-commit or push; only produce commit suggestions.
