---
name: figma-implement-design
description: Unified Figma implementation + refinement workflow that translates Figma designs into production-ready code, reconciles design tokens, and performs regression-safe metadata updates. Prefer canonical local exports under `.agents/figma/components`, `.agents/figma/screens`, and `.agents/figma/frames`.
disable-model-invocation: false
maturity: stable
---

# Figma — Implement & Refine

This skill combines implementation-focused guidance (translating Figma nodes into repository code) with refinement and regression-safe design QA (token reconciliation, nodeId verification, and metadata corrections). It prefers local canonical exports and only calls MCP tools when live data is required.

## Local Figma Exports (preferred)

Repository convention: canonical Figma exports live under `.agents/figma/` in three folders with distinct semantics:

- `.agents/figma/components/` — exported component SVGs (vector icons and reusable artwork). Use these to map component names to vector assets and avoid re-requesting static renders.
- `.agents/figma/screens/` — exported screen artifacts (`.pdf` and `.png`) for full-screen visual/layout diffs and review.
- `.agents/figma/frames/` — full-frame exports (PDF/PNG) of the `Foundations` and `Components` pages used as canonical references and baselines.

When a required export is present locally, prefer it for visual validation and asset extraction. Only call MCP tools (for node JSON or screenshots) when the local export is missing or authoritative live data is required.

Semantics reminder: `components` = SVG vectors, `screens` = PDF/PNG screen exports, `frames` = full page/frame exports for reference.

## When to use this skill

- Implementation: produce or update repository code (components, pages, variants). Follow the Implementation branch.
- Refinement / Design QA: reconcile tokens, verify nodeIds, and perform regression audits. Follow the Refinement branch.

If the request is to edit Figma nodes directly, use `figma-use`. If the request is to generate full Figma pages from text, use `figma-generate-design`.

## Prerequisites

- Figma MCP server (or `figma-desktop` MCP) accessible and authorized.
- Local export directory `.agents/figma/` may contain `components/`, `screens/`, and `frames/`.
- Task context in `.agents/tasks/<task-file>.md` and `.agents/poc-context.json` when running refinement.

## High-level workflow

1. Safety & regression checks (always for refinement-sensitive work).
2. Load context files and local exports.
3. Identify objective: `implement` or `refine`.
4. Follow Implementation or Refinement branch.
5. Apply changes behind a regression gate; produce a structured report (do not commit).

### 1 — Safety & regression checks

- Inspect recent tasks in `.agents/tasks/` (default N=3). Mark tasks that modified layout or security-sensitive UI as `regression-sensitive`.
- If regression-sensitive tasks exist, include them in the comparison set and run layout diffs. If diffs indicate risk, require manual review and do not auto-apply breaking changes.

### 2 — Load context

Read in order:

- `.agents/poc-context.json` — execution order, token format
- `.agents/tasks/<task-file>.md` — acceptance checklist and component references
- `.agents/figma.meta.json` — fileKey and nodeId map
- `.agents/design-system.meta.json` — current tokens and component registry
- `.agents/design-system.plan.md` — strategy and priorities

Prefer local exports under `.agents/figma/components`, `.agents/figma/screens`, and `.agents/figma/frames` before calling MCP.

### 3 — Identify objective

- Implementation branch: implement or update repository code.
- Refinement branch: reconcile tokens, verify `figmaNodeId`s, and apply safe metadata corrections.

## Implementation branch (translate Figma → code)

1. Get Node ID
   - Parse `fileKey` + `nodeId` from a Figma URL or use `figma-desktop` selection.
2. Fetch design context and screenshot
   - `get_design_context(fileKey, nodeId)` → layout, typography, tokens
   - `get_screenshot(fileKey, nodeId)` → visual reference
3. Prefer local assets
   - Check `.agents/figma/components/` for SVGs before downloading duplicates.
4. Download assets returned by MCP (icons, images, SVGs).
5. Translate to project conventions
   - Reuse existing primitives, map Figma tokens to project tokens, use `cn()` for class merging.
6. Implement components/pages
   - Add TypeScript props, small docs, and unit/visual tests where appropriate.
7. Validate visually
   - Compare implemented UI to screenshot: spacing, typography, colors, interactive states.

## Refinement branch (tokens, metadata, regression audits)

1. Determine target task
   - Choose the last `in_progress` or `pending` task by `execution_order`, excluding tasks with unresolved regression flags unless audit passes.
2. Extract design references
   - Component names, `figmaNodeId`s, token names, layout snapshots, local export paths.
3. Query Figma only as needed

```
mcp_framelink_fig_get_figma_data(fileKey, nodeIds)
```

4. Compare
   - Colors: `design-system.meta.json` vs Figma values (hex/HSL). Flag divergences.
   - Typography: scale entries vs Figma text styles.
   - Components: verify `figmaNodeId` and `type` (`component` vs `asset`).
   - Layout/regressions: pixel/DOM/class diffs across tasks.

5. Apply corrections (regression gating)
   - Create `regression_audit` with compared tasks and `risk` ∈ {none, low, medium, high}.
   - If `risk` is `none` or `low`: apply minimal corrections and annotate changes with `regression_audit: { status: "auto-applied", ... }`.
   - If `risk` is `medium` or `high`: write a draft (`.agents/design-system.meta.json.draft`) and require manual review. Do NOT overwrite production meta automatically.

6. Update task checklist
   - Mark verifiable acceptance items and add a `Regression audit` checklist entry with status.

## Deliverables & Reporting

Always produce a structured report (do not commit). Example report:

```
## Task <id> — <Task Name> processed

### What was done
- <bullet per file or feature implemented or corrected>

### Acceptance criteria
- [x] yarn build passes with zero errors
- [x] yarn lint passes with zero warnings
- Regression audit: <status> (risk: <level>)

### Suggested commit (developer to run)
```

Provide a conventional commit suggestion (type/scope/short message) and list any draft files created.

## Operational rules

- Prefer local exports under `.agents/figma/` before calling MCP tools.
- If an MCP call fails with permissions, STOP and ask the user for the Figma token.
- NEVER auto-commit, stage, or push. Produce commit suggestions only.
- Convert hex → HSL only if `.agents/poc-context.json` requires it.
- Preserve existing task acceptance history when marking checklist items.
- Do not add external icon packages; use SVGs from Figma exports or MCP assets.

## Asset rules (quick)

- Use `.agents/figma/components/*.svg` for component vectors.
- Use `.agents/figma/screens/*.{pdf,png}` for full-screen diffs.
- Use `.agents/figma/frames/*.{pdf,png}` for Foundations/Components reference frames.

---

This consolidated skill covers both code implementation and refinement workflows for Figma-driven work in this repository. For direct Figma edits use `figma-use`; for generation of new Figma pages use `figma-generate-design`.
