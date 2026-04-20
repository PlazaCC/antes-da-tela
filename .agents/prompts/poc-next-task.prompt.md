---
name: poc-next-task
agent: agent
description: |
  Executes the next pending POC task by following the `.agents/skills/poc-next-task/SKILL.md` rules. Use for starting the next task, resuming an in-progress task, or targeting a specific task by ID.
argument-hint: '[task_id] — optional (e.g. poc-10). Omit to auto-detect the next pending/in-progress task from .agents/poc-context.json'
tools: [vscode, execute, read, agent, edit, search, web, browser, 'framelink_figma_mcp/*', 'plaza.mcp/*', todo]
---

Follow the `poc-next-task` skill exactly as defined in `.agents/skills/poc-next-task/SKILL.md`.
