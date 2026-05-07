---
name: brainstorming
description: Use when the Antes da Tela POC needs a new task direction or clearer scope before handing work off to /create-poc-task in the documented AI workflow.
---

# Brainstorming

## Overview

This skill is the ideation entry point for the workflow documented in `docs/AI-DRIVEN-WORKFLOW.md`.

Use it to turn a vague request, product idea, UX gap, or technical opportunity into one or more task-ready proposals for the Antes da Tela POC.

This is a read-only step. It clarifies, compares, and recommends. It does not create the task itself. The handoff is `/create-poc-task`.

<HARD-GATE>
Stay read-only.

Do NOT write code, edit files, create task files, run builds/tests, or invoke implementation skills.
Do NOT invoke `writing-plans`.
Do NOT improvise a parallel workflow.

The only valid end state is an approved proposal that is ready to be turned into a task with `/create-poc-task`.
</HARD-GATE>

## When to Use

Use this skill when:

- There is **no suitable task yet** in the current POC backlog.
- The current request is still vague and needs project-aware scoping.
- A possible improvement exists, but it still needs options, trade-offs, and a recommendation before becoming a task.
- A broad idea needs to be decomposed into smaller task candidates.

Do NOT use this skill when:

- A matching task already exists and should just be executed. Use `/poc-next-task`.
- The user already knows the exact task they want and only needs it formalized. Use `/create-poc-task`.
- The work is already in implementation or review. Use the appropriate execution or review skill.

## Workflow Fit

This skill is only the first decision step of the documented flow:

- No suitable task yet: use `brainstorming`
- Task idea is approved and concrete: use `/create-poc-task`
- Task already exists and should be executed: use `/poc-next-task`

If the request already belongs to one of the later states, say so directly and hand off to the correct skill instead of continuing ideation.

## Required Context

Before asking questions, inspect the current project context in read-only mode. Start with:

- `docs/AI-DRIVEN-WORKFLOW.md`
- `docs/poc/context.json`
- `docs/poc/tasks/summary.md`
- `docs/AGENTS-CONTEXT.md`
- nearby files or docs directly related to the request

Check whether the idea is already covered by an existing task. If it is, say so explicitly and recommend `/poc-next-task` instead of inventing another task.

## Quick Reference

1. Read the workflow and current backlog.
2. Ask one clarifying question at a time.
3. Propose 2-3 task directions with trade-offs.
4. Recommend the smallest valuable next task.
5. Output a `/create-poc-task`-ready payload.

## Process

1. **Read the current workflow and backlog**

- Understand where the request fits in the current project phase.
- Look for overlaps, dependencies, and missing pieces.

2. **Ask clarifying questions one at a time**

- Focus on user value, constraints, urgency, dependencies, and success criteria.
- Prefer multiple choice when possible.

3. **Propose 2-3 task directions**

- Present trade-offs clearly.
- Lead with your recommended option and explain why it best fits the project now.

4. **Narrow to the best next task**

- Prefer the smallest valuable task that can move the POC forward cleanly.
- If the request is too large, split it into multiple future task candidates and only recommend the next one.

5. **Present a `/create-poc-task`-ready payload**

- Package the chosen direction so it can be turned into a task without more ideation.
- Wait for approval or corrections.

## Output Contract

When the conversation converges, produce a task-ready proposal in this shape:

```markdown
Title: <task title>
Scope: Frontend | Backend | Full-stack
Priority: P0 | P1 | P2 | P3 | P4
Description: <1-3 sentences>

Why now:

- <dependency, opportunity, or backlog reason>

Already done:

- <known existing work>

Gaps:

- <what is missing>

Key files:

- <likely files or areas>

Figma node id:

- <optional>

Mobile specs:

- <optional>

Suggested acceptance criteria:

- <criterion>
- <criterion>

Next step:

- Run `/create-poc-task` with this payload.
```

Match the proposal to the inputs expected by `/create-poc-task` whenever possible: `title`, `scope`, `priority`, `description`, plus optional `figma_nodeId`, `key_files`, `already_done`, `gaps`, and `mobile_specs`.

## Core Pattern

- One question per message.
- Prefer multiple choice when it reduces ambiguity.
- Always propose alternatives before locking the task shape, unless the user already chose the direction.
- Ground every suggestion in the real Antes da Tela context, backlog, docs, and nearby code.
- Decompose broad requests into smaller candidate tasks.
- Recommend, do not execute.

## Visual Companion

If the main uncertainty is visual, structural, or Figma-related, you may offer the visual companion as a separate message.

If accepted, use it only to improve understanding of the options. The skill still remains read-only and must still end with task-ready proposals for `/create-poc-task`.

## Common Mistakes

- Turning brainstorming into implementation.
- Proposing a task without checking whether it already exists in the backlog.
- Returning one oversized task instead of a smaller next slice.
- Producing generic ideas that are not grounded in the current repo state.
- Ending without a payload that `/create-poc-task` can use directly.

## Success Criteria

This skill succeeded only if all of the following are true:

- The result fits the workflow in `docs/AI-DRIVEN-WORKFLOW.md`.
- The output is ready to be turned into a task with `/create-poc-task`.
- The proposal is grounded in the actual project context and current backlog.
- No implementation or file mutation happened during brainstorming.
