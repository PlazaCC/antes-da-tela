---
name: create-pr
description: Use when the implementation of a feature or bugfix is complete and you need to generate a professional, conventional pull request description summarizing the changes against the main branch.
---

# Create PR — Conventional Pull Request Generator

## Overview

Analyzes current branch changes (staged and unstaged) relative to `main` and generates a structured, professional PR description in English following Conventional Commits and project best practices.

**Core principle:** Summarize the "What" and "Why" while providing a clear checklist for reviewers.

---

## When to Use

- When a development branch is finished and all tasks/tests are passing.
- When you are about to create a PR on GitHub or GitLab.
- When asked to "summarize my changes" or "prepare a PR description".

---

## Implementation

### Step 1 — Analyze Changes

Identify the current branch and compare it to `main` (or `master`).

```bash
git branch --show-current
git diff --name-status main...HEAD
git diff main...HEAD
```

Include all staged and unstaged changes in your mental model of the current state.

### Step 2 — Summarize Scope

1. List affected files and change types (added, modified, deleted).
2. Highlight key features, bug fixes, refactors, or breaking changes.
3. Note dependency updates, migrations, or config changes.

### Step 3 — Generate Description

Format the output in clear, professional English:

- **Title:** Concise, imperative, conventional style (e.g., `feat: add user profile page`).
- **Description:** 
  - **What:** Summary of functional changes.
  - **Why:** Rationale for the changes and any relevant context.
  - **Migration/Context:** Any steps needed for deployment or environment changes.
- **Checklist:** Standard project verification steps.

---

## Output Format

```
Title: <conventional-title>

<detailed description>

Checklist:
- [ ] Tests
- [ ] Documentation
- [ ] Database migration (if applicable)
- [ ] Ready for review
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Incomplete diff | Include both staged and unstaged changes in analysis. |
| Vague title | Use imperative mood and type (feat, fix, refactor, etc.). |
| Missing breaking changes | Clearly highlight any backward-incompatible changes. |
| Using non-English | Always generate the PR description in English. |

---

## Integration

**Called after:** `code-review` and `verification-before-completion`.
**Called before:** `finishing-a-development-branch`.
