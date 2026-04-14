---
name: add-dependency
description: Adds a new npm package to the project using Yarn 4. Use when installing any new library. This skill ensures the correct package manager is used and updates relevant documentation.
argument-hint: "[package-name] e.g. react-hook-form, @hookform/resolvers"
allowed-tools: Bash, Read, Write
---

Add the npm package **$ARGUMENTS** to the project using Yarn 4.

## Steps

1. **Install the package**:
```bash
yarn add $ARGUMENTS
```
For dev dependencies, add `-D`:
```bash
yarn add -D $ARGUMENTS
```

2. **Verify** the package appears in `package.json`.

3. **Check for types** — if the package doesn't include TypeScript types, check for a `@types/$ARGUMENTS` package:
```bash
yarn add -D @types/$ARGUMENTS
```

4. **Check compatibility** — if the package requires specific Next.js transpile config (e.g., ESM-only packages), update `next.config.ts`:
```ts
const nextConfig: NextConfig = {
  transpilePackages: ["$ARGUMENTS"],
}
```

5. **Update docs** — if the package is a core stack addition (not just a utility), note it in `docs/SETUP.md` under the appropriate step.

## Rules
- Always use `yarn add` — never `npm install` or `pnpm add`.
- `yarn dlx` for one-off scripts (e.g., `yarn dlx shadcn@latest add button`).
- Do not install packages that duplicate existing stack capabilities:
  - Auth: Supabase Auth is the standard — do not add Auth.js, Clerk, etc.
  - Forms: prefer shadcn Form + react-hook-form + zod (already in the Zod ecosystem).
  - API: tRPC is the standard — do not add Axios, fetch wrappers, etc.
