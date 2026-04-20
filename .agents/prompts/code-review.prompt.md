---
name: code-review
agent: agent
description: |
  Runs a full diff-based code review of the current branch against main, reads every changed file, validates against project rules, and produces a concrete action plan with file:line references. Do NOT use on main branch.
tools:
  [
    vscode,
    execute,
    read,
    agent,
    edit,
    search,
    web,
    'io.github.upstash/context7/*',
    'playwright/*',
    browser,
    'gitkraken/*',
    todo,
  ]
---

Follow the `code-review` skill exactly as defined in `.agents/skills/code-review/SKILL.md`.
