---
name: poc-refine-design
description: Use when a POC task has been implemented and needs design alignment with Figma — tokens diverge, components are mismatched, or the design-system metadata is stale. Triggers: post-implementation review, design QA pass, or when `.agents/design-system.meta.json` may be out of sync with the Figma source.
---

# poc-refine-design

Align the last completed (or in-progress) POC task with the Figma design source. Compares `.agents/design-system.meta.json` against live Figma data, resolves token/component divergences, applies all corrections, updates task checklists, and performs layout-regression checks against recent tasks to prevent regressions and security regressions.

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

**Before calling FramLink MCP**, check for local Figma exports (prefer local assets to reduce MCP payload and speed comparisons):

- `.agents/figma/components/*.svg` — exported component SVGs (use to map component names to vector assets and avoid re-requesting static renders).
- `.agents/figma/screens/*.{pdf,png}` — exported screen PDFs/PNGs for visual/layout diffs (task-specific screens).
- `.agents/figma/frames/*.{pdf,png}` — full-frame exports of the `Foundations` and `Components` pages for reference and baseline comparisons.

Prefer these local exports when available; only call `mcp_framelink_fig_get_figma_data` to fetch node JSON or rendered assets if a required export is missing or when authoritative live data is needed.

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

Use `figma.meta.json.components` to map component names → nodeIds. Prefer mapping via local SVG filenames in `.agents/figma/components/` when names match. Request only nodes relevant to the task (pages `Foundations` + task-specific frames) and fetch rendered exports only when local screen/frame exports are not available or when live assets are required for verification.

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

- Always run the recent tasks verification and regression audit before applying changes that affect layout or interactive components.
- For `risk` levels `medium` or `high` require manual approval — do not apply automatically.
- Ask for MCP token on permission failure — never write incomplete data.
- Never auto-commit or push; produce a commit suggestion and save drafts when needed.
- Convert hex → HSL only when `poc-context.json.tokens_format` requires it.
- Preserve existing task acceptance history — when marking checklist items, include audit metadata.
