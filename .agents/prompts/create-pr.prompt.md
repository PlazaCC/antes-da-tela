---
name: 'create-pr'
description: >-
  Analyze the current branch (including staged and unstaged changes) and compare it to the main/master branch. Summarize all changes and generate a conventional, well-structured pull request description in English, following best practices for PRs.
applyTo: '**'
---

# Conventional PR Generator

## Instructions

1. Identify the current branch and compare it to the main/master branch.
2. Include all staged and unstaged changes in the analysis.
3. Summarize the changes:
   - List all affected files and their types of changes (added, modified, deleted, renamed).
   - Highlight key features, bug fixes, refactors, or breaking changes.
   - Note any dependency updates, migrations, or config changes.
4. Generate a pull request description in clear, professional English, following the Conventional Commits and PR best practices:
   - Title: concise, imperative, conventional style (e.g., "feat: add user profile page")
   - Description: what, why, and any context or migration steps
   - Checklist (if relevant): [ ] Tests, [ ] Docs, [ ] Migration, etc.
5. Output only the PR title and body, ready to be pasted into a GitHub/GitLab PR form.

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

## Notes

- Always use English.
- Be concise but thorough.
- If the branch is not up to date with main/master, note it in the PR body.
- If there are breaking changes, highlight them clearly.
