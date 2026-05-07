---
paths:
  - '.agents/skills/**'
  - '.claude/skills/**'
  - '.cursor/skills/**'
  - 'scripts/sync-skills.mjs'
---

# Skills.sh Ecosystem Rules

This document defines the standards for creating, maintaining, and synchronizing agent skills across this repository using the official [skills.sh CLI](https://skills.sh/docs).

## Canonical Source

- **Authoritative:** `.agents/skills/` — All SKILL.md files live here
- **Read-only (synced):** `.claude/skills/`, `.cursor/skills/`, etc. — Agent-specific directories populated by `yarn skills`
- **Never edit:** Synced skill directories — always edit in `.agents/skills/` and resync

## Pre-Commit Quality Gate

Before each commit, `.husky/pre-commit` automatically runs:

1. **Type Check** — `yarn type-check` (validates TypeScript)
2. **Linting** — `yarn lint` (validates code style)

✅ If all pass → commit proceeds
❌ If any fail → commit aborted, you fix errors and retry

Skill sync is manual. Run `yarn skills` whenever `.agents/skills/` changes.

## SKILL.md Format Requirements

Every skill **must** have:

### Frontmatter (YAML)

```yaml
---
name: unique-skill-name
description: One-sentence description of what this skill does and when to use it
---
```

- `name`: lowercase, hyphens only (no spaces, underscores, or special chars)
- `description`: Single line, max 150 chars
- **Both required** — missing either causes "No skills found" error

### Body (Markdown)

```markdown
---
name: my-skill
description: Brief description
---

# Skill Title

Brief overview of what the skill does.

## When to Use

- Scenario 1
- Scenario 2

## Steps

1. Do this
2. Then that

## References

- [Link to relevant docs]
```

**Best practices:**

- Use `##` (h2) for section headers — h1 is auto-generated from filename
- Include "When to Use" section always
- List 2–5 specific triggers or use cases
- Keep total length under 2000 words (scannable)

## Skill Discovery

The skills.sh CLI automatically searches these directories in order:

1. Root directory (if `SKILL.md` exists)
2. `skills/`
3. `skills/.curated/`
4. `skills/.experimental/`
5. `skills/.system/`
6. `.aider-desk/skills/` → `.zencoder/skills/` (agent-specific paths)
7. **`.claude/skills/` ← Claude Code**
8. **`.agents/skills/` ← Generic agents**
9. Recursive search if nothing found

**For this repo:** `.agents/skills/` is the primary source.

## Synchronization Workflow

### Local Development

After creating or modifying a skill in `.agents/skills/`:

```bash
# Sync to all detected agents (Claude Code, Cursor, etc.)
yarn skills

# Force resync (nuke .claude/skills/ and reinstall)
yarn skills:force

# Single agent (Claude Code only)
yarn skills --agent=claude-code
```

### Automatic (Git Hooks)

On each `git commit`:

- **Type Check** (`yarn type-check`) — Validates TypeScript syntax
- **Linting** (`yarn lint`) — Validates code style with ESLint
- If ANY check fails, commit is aborted
- Skill sync remains a manual step when skills change
- Fix errors, rerun checks, and sync separately if needed

### CI/CD

In GitHub Actions:

```yaml
- name: Sync agent skills
  run: yarn skills

- name: Verify no uncommitted skill changes
  run: git diff --quiet
```

## File Organization

```
.agents/skills/
├── skill-1-name/
│   └── SKILL.md
├── skill-2-name/
│   └── SKILL.md
├── ...
└── skill-65-name/
    └── SKILL.md

.claude/skills/  ← Auto-populated by yarn skills
├── skill-1-name/
│   └── SKILL.md (copy)
├── skill-2-name/
│   └── SKILL.md (copy)
└── ...
```

Each skill is a **directory containing a single SKILL.md file**.

## Naming Conventions

| What             | Format            | Example                        |
| ---------------- | ----------------- | ------------------------------ |
| Skill directory  | `kebab-case`      | `pdf-viewer-debugger`          |
| `name` field     | `kebab-case`      | `pdf-viewer-debugger`          |
| File structure   | `{name}/SKILL.md` | `pdf-viewer-debugger/SKILL.md` |
| Skill title (h1) | Title Case        | `PDF Viewer Debugger`          |

## Versioning

Skills do not have explicit versions. Updates are pulled live from `.agents/skills/` on each sync.

If you need to maintain multiple versions:

- Create separate skills: `skill-name-v1`, `skill-name-v2`
- Document breaking changes in the `description`

## Quality Checklist

Before committing a new or modified skill:

- [ ] YAML frontmatter present and valid
  - [ ] `name`: lowercase, kebab-case only
  - [ ] `description`: single line, ≤150 chars
- [ ] Markdown content present
  - [ ] h2 headers for sections
  - [ ] "When to Use" section included
  - [ ] No h1 headers (auto-generated)
- [ ] No personal information or secrets
- [ ] Links are absolute (not relative to `.agents/`)
- [ ] No references to deleted or moved files
- [ ] Run `yarn skills` before committing if `.agents/skills/` changed
- [ ] `.claude/skills/` changes are committed (auto-updated)

## Common Tasks

### Create a new skill

```bash
npx skills init skills/my-new-skill
# Edit: skills/my-new-skill/SKILL.md
yarn skills
git add skills/my-new-skill/ .claude/skills/my-new-skill/
git commit -m "feat(skills): add my-new-skill"
# Pre-commit runs: type-check → lint
# ✅ All checks pass → commit succeeds
```

If type-check or lint fails:

```bash
# Pre-commit error output shown:
# ❌ ESLint error: unused variable
# ❌ Linting failed. Commit aborted.

# Fix the issue:
yarn lint --fix
# or manually fix the error

# Try commit again:
git add .
git commit -m "feat(skills): add my-new-skill"
# ✅ All checks pass → commit succeeds
```

### Rename a skill

```bash
mv .agents/skills/old-name .agents/skills/new-name
# Update name: field in SKILL.md to match
yarn skills
git add .agents/skills/new-name/ .claude/skills/
git commit -m "refactor(skills): rename old-name → new-name"
```

### Remove a skill

```bash
rm -rf .agents/skills/my-skill
yarn skills
git add -A .agents/skills/ .claude/skills/
git commit -m "chore(skills): remove my-skill"
```

### Update all skills (resync)

```bash
yarn skills:force
git add .claude/skills/ .cursor/skills/ .agents/skills/
git commit -m "chore(skills): force resync all agent directories"
```

## Troubleshooting

### "No skills found"

1. Verify `SKILL.md` has valid YAML frontmatter
2. Check `name` and `description` fields exist and are non-empty
3. Run `npx skills list` to debug

### Skill not appearing in agent

1. Verify skill was synced: `yarn skills`
2. Check agent's skills directory exists: `.claude/skills/`
3. Verify skill file is at correct path: `.claude/skills/{name}/SKILL.md`
4. Force resync: `yarn skills:force`

### Divergence between `.agents/` and `.claude/`

```bash
# Restore sync
yarn skills:force

# Review the mirrored changes
git diff -- .agents/skills .claude/skills
```

## References

- [Official skills.sh Docs](https://skills.sh/docs)
- [CLI Reference](https://skills.sh/docs/cli)
- [Agent Skills Specification](https://agentskills.io/)
- [GitHub: vercel-labs/skills](https://github.com/vercel-labs/skills)
