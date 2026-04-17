---
name: poc-refine-design
description: Use when a POC task has been implemented and needs design alignment with Figma — tokens diverge, components are mismatched, or the design-system metadata is stale. Triggers: post-implementation review, design QA pass, or when `.agents/design-system.meta.json` may be out of sync with the Figma source.
---

# poc-refine-design

Align the last completed (or in-progress) POC task with the Figma design source. Compares `.agents/design-system.meta.json` against live Figma data, resolves token/component divergences, applies all corrections, and updates task checklists.

## Workflow

### 1. Load Context

Read in order:
- `.agents/poc-context.json` — execution order, task list, token format
- `.agents/tasks/<task-file>.md` — acceptance checklist, component references
- `.agents/figma.meta.json` — `fileKey`, page/component nodeId map
- `.agents/design-system.meta.json` — current tokens, component registry
- `.agents/design-system.plan.md` — strategy and priorities

**Before calling FramLink MCP**, check for local assets:
- `.agents/figma/components/*.svg`
- `.agents/figma/frames/*.pdf|png`
- `.agents/figma/screens/*`

Prefer local assets to reduce MCP payload.

### 2. Determine Target Task

Pick the last task with `status` in `["in_progress", "pending"]` ordered by `execution_order` (highest number wins, e.g. `poc-07` > `poc-06`).

### 3. Extract Design References

From the task file, collect:
- Component names (e.g. `StarRating`, `RatingBox`, `Avatar`, `ScriptCard`)
- Figma nodeIds referenced
- Token names used

### 4. Query Figma via FramLink MCP

```
mcp_framelink_fig_get_figma_data(fileKey, nodeIds)
```

Use `figma.meta.json.components` to map component names → nodeIds. Request only nodes relevant to the task (pages `Foundations` + task-specific frames).

If the MCP call fails with a permissions error → **stop and ask the user for the Figma token**. Do not write partial data.

### 5. Compare

| What | How |
|------|-----|
| **Colors** | Hex/HSL in `design-system.meta.json` vs Figma. Flag duplicates and divergences. |
| **Typography** | Scale entries in meta vs Figma text styles. Note missing entries. |
| **Components** | For each task component: verify `figmaNodeId` and `type` (`component` vs `asset`) in meta. |
| **Token format** | If `poc-context.json.tokens_format` is `hsl`, convert all hex → HSL channels before comparing. |

### 6. Apply Corrections

- Consolidate tokens that share the same value under different names.
- Correct `type` field: distinguish `component` (interactive, reusable) from `asset` (image/SVG).
- Write all corrections to `.agents/design-system.meta.json`.
- If strategy changes, update `.agents/design-system.plan.md`.

Make minimal changes — do not rewrite sections unrelated to the task.

### 7. Update Task Checklist

Mark acceptance items in `.agents/tasks/<task-file>.md` as completed for items verifiably checked in this run.

### 8. Deliver Report

```
Task processed:    <task-id>
Figma nodes queried: [list]
Changes applied:
  - file: <path>
    change: <brief description>
Checklist updated: [items marked done]
Next steps / risks: <1-2 sentences>
Commit suggestion: feat(design): <message>
```

## Operational Rules

- Ask for MCP token on permission failure — never write incomplete data.
- Never auto-commit or push.
- Convert hex → HSL only when `poc-context.json.tokens_format` requires it.
