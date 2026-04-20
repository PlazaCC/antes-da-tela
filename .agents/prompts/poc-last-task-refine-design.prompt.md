---
name: poc-last-task-refine-design
agent: agent
description: 'Use when a POC task has been implemented and needs design alignment with Figma. Fast context pickup from poc-context.json and corrections applied via the `poc-refine-design` skill. No build/lint required.'
argument-hint: '[task_id] — optional (e.g. poc-10). Omit to auto-detect from .agents/poc-context.json (last in_progress or highest pending in execution_order)'
tools: [vscode, execute, read, agent, edit, search, web, browser, 'framelink_figma_mcp/*', 'plaza.mcp/*', todo]
---

Follow the `poc-refine-design` skill exactly as defined in `.agents/skills/poc-refine-design/SKILL.md`.
