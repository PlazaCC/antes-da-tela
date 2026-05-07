---
paths:
  - '.claude/skills/**'
  - '.agents/skills/**'
---

# Claude Code Skills Rules

This is the Claude Code-specific skill rules file. Synced automatically from `.agents/rules/skills-ecosystem.md` via `yarn skills:sync`.

## Quick Reference

**Source:** `.agents/skills/` (canonical)
**This location:** `.claude/skills/` (auto-synced)
**Sync command:** `yarn skills:sync`

## Never

- ❌ Edit skills in `.claude/skills/` — always edit in `.agents/skills/`
- ❌ Delete `.claude/skills/` manually — use `yarn skills:sync` CLI
- ❌ Create skills directly here — create in `.agents/skills/` and sync

## Always

- ✅ Create/modify skills in `.agents/skills/`
- ✅ Run `yarn skills:sync` after making changes
- ✅ Commit both `.agents/skills/` and `.claude/skills/` changes
- ✅ Use `yarn skills:sync:check` to verify sync before commit

## Full Rules

See `.agents/rules/skills-ecosystem.md` for complete documentation on:

- Skill creation and structure
- SKILL.md frontmatter requirements
- Discovery paths and auto-sync
- Git hooks integration
- Troubleshooting

---

**Last synced:** Auto-managed via `yarn skills:sync`
**Official docs:** https://skills.sh/docs
