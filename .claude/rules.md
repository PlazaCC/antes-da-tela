---
paths:
  - '.claude/skills/**'
  - '.agents/skills/**'
---

# Claude Code Skills Rules

This is the Claude Code-specific skill rules file. Synced automatically from `.agents/rules/skills-ecosystem.md` via `yarn skills`.

## Quick Reference

**Source:** `.agents/skills/` (canonical)
**This location:** `.claude/skills/` (auto-synced)
**Sync command:** `yarn skills`

## Never

- ❌ Edit skills in `.claude/skills/` — always edit in `.agents/skills/`
- ❌ Delete `.claude/skills/` manually — use `yarn skills` or `yarn skills:force`
- ❌ Create skills directly here — create in `.agents/skills/` and sync

## Always

- ✅ Create/modify skills in `.agents/skills/`
- ✅ Run `yarn skills` after making changes
- ✅ Commit both `.agents/skills/` and `.claude/skills/` changes
- ✅ Use `yarn skills:force` only when a regular sync is not enough

## Full Rules

See `.agents/rules/skills-ecosystem.md` for complete documentation on:

- Skill creation and structure
- SKILL.md frontmatter requirements
- Discovery paths and auto-sync
- Git hooks integration
- Troubleshooting

---

**Last synced:** Auto-managed via `yarn skills`
**Official docs:** https://skills.sh/docs
