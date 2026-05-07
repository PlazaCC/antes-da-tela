# Skills Synchronization Guide

## Official Standard

This project uses **skills.sh** — the official open-source agent skills CLI from Vercel.

### How It Works

- **Authoritative Source:** `.agents/skills/` contains all 65+ SKILL.md definitions
- **Claude Code Path:** `.claude/skills/` is synchronized TO this location by the official `npx skills` CLI
- **Never delete .claude/skills manually** — use `npx skills` commands instead

### Key Discovery Locations (Official)

The skills.sh CLI discovers skills in these locations:

- `.agents/skills/` ← **Primary canonical source**
- `.claude/skills/` ← **Claude Code integration point**
- `.agents/` → `.claude/` sync happens via CLI

### Synchronization

**One-time setup:**

```bash
yarn skills:sync
```

This installs all 65 skills from `.agents/skills/` to `.claude/skills/` using the official CLI.

**If skills don't appear in Claude Code after a fresh `git clone`:**

```bash
yarn skills:sync
```

**To force resynchronize (nuke and reinstall):**

```bash
yarn skills:sync:force
```

### Why We Sync (Not Copy-Paste or Symlinks)

The **official skills.sh CLI approach**:

- ✅ Respects the skills.sh ecosystem standard
- ✅ Automatically detects all agents on your system
- ✅ Handles `.claude/` discovery path correctly
- ✅ Supports both copy and symlink modes
- ✅ Maintains consistent metadata and telemetry

Manual approaches (NOT recommended):

- ❌ Direct copy-paste creates duplicates and maintenance debt
- ❌ Git-tracked symlinks break on Windows without special permissions

## Automatic Synchronization (Pre-commit Hooks)

All skill syncing is automatic via `.husky/pre-commit`, which runs **comprehensive quality checks** before allowing commits:

1. **Type Check** (`yarn type-check`) — Validates TypeScript
2. **Linting** (`yarn lint`) — Validates code style (ESLint)
3. **Skills Sync** (`yarn skills:sync`) — Auto-syncs if `.agents/skills/` changed

**Result:** If ANY check fails, the commit is aborted. You must fix errors before trying again.

### How It Works

```bash
$ git commit -m "feat: add new feature"

# Pre-commit hook runs:
✓ yarn type-check
  ✅ Types valid
✓ yarn lint
  ✅ Linting passed
✓ Detect .agents/skills/ changes
  ✓ yarn skills:sync
  ✅ Skills synced and staged
✓ Commit proceeds with all checks passed
```

Or if there's an error:

```bash
$ git commit -m "feat: add feature with bug"

# Pre-commit hook runs:
✓ yarn type-check
✓ yarn lint
  ❌ ESLint error: unused variable on line 42
  ❌ Linting failed. Commit aborted.

# You fix the error and try again:
$ yarn lint          # Fix error
$ git add .
$ git commit -m "feat: add feature with bug fix"
```

## Intelligent Multi-Agent Support

`scripts/sync-skills.js` automatically detects and syncs to all installed agents:

- `.claude/skills/` (Claude Code)
- `.cursor/skills/` (Cursor IDE)
- `.cline/skills/` (Cline)
- `.agents/skills/` (Generic agents)
- And more...

**No configuration needed** — detection is automatic.

### Manual Control

```bash
# Incremental sync (smart add)
yarn skills:sync

# Force resync (rebuild all)
yarn skills:sync:force

# Single agent
yarn skills:sync --agent=cursor

# Verify sync status
yarn skills:sync:check
```

## Project Rules

See `.agents/rules/skills-ecosystem.md` for complete standards on:

- SKILL.md format and validation
- Naming conventions
- Discovery paths
- Quality checklist
- Troubleshooting guide
- ❌ Splits source of truth between `.agents/` and `.claude/`

### CI/CD Integration

In GitHub Actions or CI:

```yaml
- name: Sync skills
  run: yarn skills:sync
```

### Troubleshooting

**Q: Skills not showing in Claude Code?**
A: Run `yarn skills:sync` to refresh the sync.

**Q: "No skills found" error?**
A: Ensure all SKILL.md files in `.agents/skills/` have valid YAML frontmatter:

```yaml
---
name: skill-name
description: What this skill does
---
```

**Q: Can I edit skills in `.claude/skills/`?**
A: No. Always edit in `.agents/skills/` and resync:

```bash
yarn skills:sync
```

### References

- [Official skills.sh Documentation](https://skills.sh/docs)
- [Official CLI Reference](https://skills.sh/docs/cli)
- [Skill Discovery Rules](https://skills.sh/docs#skill-discovery)
- [GitHub: vercel-labs/skills](https://github.com/vercel-labs/skills)
