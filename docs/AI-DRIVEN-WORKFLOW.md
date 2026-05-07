# AI Driven Workflow

## Purpose

This document defines the current AI driven workflow used in this project.
The workflow is skill first.
Each stage is driven by a specific skill.

## Two Starting Cases

There are only two valid starting cases.

### Case 1

There are tasks in the pipe.

Start with `/poc-next-task`.
This skill picks the next available POC task and moves execution forward.

### Case 2

There are no tasks in the pipe.

Start with `/brainstorm`.
Use it to refine the idea, clarify the objective, and define the scope.

After the idea is clear, use `/create-poc-task`.
This creates the new task that will enter the pipe.

Once the new task exists, return to `/poc-next-task`.

## Standard Cycle

The delivery cycle follows the same sequence.

1. `/brainstorm` refines the idea when a new task must be created or when the current direction is still unclear.
2. `/create-poc-task` creates the task after the idea is ready.
3. `/poc-next-task` executes the next available task.
4. `/create-pr` creates the pull request from the current branch.
5. `/code-review` reviews the PR branch.
   - If there are fixes needed, address them and run both steps again.
   - Repeat until the review passes.

## Optional Design Step

Use `/poc-refine-design` when the current task needs a design refinement pass with Figma.
This step is optional.
It should be used only when the task needs visual alignment, design correction, or a clearer implementation target.

## Practical Flows

### Flow A

Tasks already exist.

1. Run `/poc-next-task`.
2. Implement the selected task.
3. Run `/poc-refine-design` if the task needs Figma refinement.
4. Run `/create-pr`.
5. Run `/code-review`.
   - If the review passes, the work is done.
   - If there are fixes, address them and go back to step 4.

### Flow B

No tasks exist.

1. Run `/brainstorm`.
2. Run `/create-poc-task`.
3. Run `/poc-next-task`.
4. Run `/poc-refine-design` if the task needs Figma refinement.
5. Run `/create-pr`.
6. Run `/code-review`.
   - If the review passes, the work is done.
   - If there are fixes, address them and go back to step 5.

## Skill Roles

`/brainstorm` defines and sharpens the idea.

`/create-poc-task` turns the refined idea into a tracked task.

`/poc-next-task` is the execution entry point for delivery work.

`/poc-refine-design` improves the current task when design work needs another pass with Figma.

`/create-pr` opens the pull request from the current branch.

`/code-review` reviews the PR branch and signals whether it is ready or needs fixes. Cycles with `/create-pr` until the review passes.

## Operating Rule

Do not improvise a parallel flow.
Follow the next skill that matches the current state of the work.

If there is no task, create one through idea refinement.

If there is a task, execute it.

If the implementation needs design alignment, refine the design.

If the implementation is complete, open the pull request.

If the review finds issues, fix them and open a new pull request. Repeat until the review passes.

## Summary

The workflow starts from task availability.

If tasks already exist, begin with `/poc-next-task`.

If tasks do not exist, begin with `/brainstorm`, then create the task with `/create-poc-task`, then return to `/poc-next-task`.

From there, the cycle is execution, optional design refinement, review, and pull request creation.
