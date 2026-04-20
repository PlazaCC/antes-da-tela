---
name: poc-last-task-refine-design
agent: agent
description: Aligns the last completed/in-progress POC task with Figma. Fast context pickup from poc-context.json, queries Figma MCP for live token/component data, resolves divergences in design-system.meta.json, and updates task checklists. No build/lint required.
argument-hint: "[task_id] — optional (e.g. poc-10). Omit to auto-detect from .agents/poc-context.json (last in_progress or highest pending in execution_order)"
tools: [read, edit, search, 'framelink_figma_mcp/*', todo, 'plaza.mcp/*']
---

## Fast Context Pickup

**2 reads to start:**

1. Read `.agents/poc-context.json` — find target:
   - Argument provided → match `id` directly
   - Last `in_progress` by execution_order → resume
   - Highest `pending` by execution_order → start
2. Read the `task_file` for that task.

**Do NOT run builds or checks.** This skill is design-only; no compilation needed.

---

## Figma Source

Always use Figma via MCP FramLink. No local assets in `.agents/figma/`.

- `.agents/figma.meta.json` → fallback for `fileKey` only
- `.agents/design-system.meta.json` → fallback for current token registry
- Official links (file key from `figma.meta.json`):
  - Main flow: `node-id=186-1388`
  - Script registration: `node-id=186-1350`
  - User profile: `node-id=186-2075`

---

## Workflow

### 1. Extract Design References
From the task file collect: component names, Figma nodeIds, token names.

### 2. Query Figma
Call `mcp_framelink_fig_get_figma_data(fileKey, nodeIds)` — only nodes used by this task.
If MCP returns a permissions error → stop and ask for Figma token. Do not write partial data.

### 3. Compare

| What | Check |
|------|-------|
| Colors | Hex/HSL in meta vs Figma — flag duplicates, divergences |
| Typography | Scale entries in meta vs Figma text styles — note missing |
| Components | `figmaNodeId` + `type` (`component` vs `asset`) coherence |
| Token format | Convert hex→HSL **only** if `poc-context.json.tokens_format` = `hsl` |

### 4. Apply Corrections (scope-restricted)

- Touch only tokens/components referenced by the target task
- Consolidate duplicate tokens (same value, different names)
- Correct `type`: `component` (interactive/reusable) vs `asset` (SVG/image)
- Update `.agents/design-system.meta.json` — preserve existing notes, minimal diff
- Update `.agents/design-system.plan.md` only if strategy changed
- **Do not modify `components/ui/*` broadly** — only minimal localized changes that clearly won't cause regressions; for larger changes, generate a PR suggestion instead

### 5. Update Checklist
Mark `- [ ]` → `- [x]` in the task file only for items verifiably complete from local evidence.
If verification requires a browser or build, add a note: `⚠️ requires manual QA`.

### 6. Report

```
Task: <id>
Figma nodes queried: [list]
Changes applied:
  - <file>: <what changed>
Checklist updated: [items]
Commit suggestion: feat(design-<id>): <description>
```

---

## Hard Constraints

- No git commit/push — suggestions only
- No build/lint — design refinement is code-free
- Minimal changes — do not rewrite unrelated sections
- Never write tokens or secrets to project files
