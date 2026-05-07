# Skills Synchronization Guide

## Source of truth

- Canonical skills live in `.agents/skills/`.
- Claude consumes the mirrored copies in `.claude/skills/`.
- Never edit `.claude/skills/` directly.

## Commands

The project exposes two package scripts backed by `scripts/sync-skills.mjs`:

```bash
yarn skills
yarn skills:force
```

Use them as follows:

- `yarn skills` updates `.claude/skills/` from `.agents/skills/`.
- `yarn skills:force` rebuilds the sync from scratch.

## Current workflow

Skill sync is **manual**.

Run `yarn skills` whenever one of these is true:

- You changed any file under `.agents/skills/`.
- You pulled changes that modified skills.
- Claude is not discovering a skill you expect to be available.

## Pre-commit behavior

`.husky/pre-commit` does **not** run skill sync anymore.

The hook currently runs only:

1. `yarn type-check`
2. `yarn lint`

That means keeping `.claude/skills/` aligned is an explicit step, not an automatic side effect of `git commit`.

## Recommended sequence after skill edits

```bash
yarn skills
yarn type-check
yarn lint
```

If a regular sync is not enough, run `yarn skills:force` and review the resulting diff.

## Troubleshooting

**Skills not showing in Claude Code**

Run:

```bash
yarn skills
```

**Sync command fails**

Check that every `SKILL.md` under `.agents/skills/` has valid YAML frontmatter with at least:

```yaml
---
name: skill-name
description: What this skill does
---
```

**Unsure where to edit a skill**

Edit `.agents/skills/` only, then resync.

## References

- https://skills.sh/docs
- https://skills.sh/docs/cli
- https://github.com/vercel-labs/skills
