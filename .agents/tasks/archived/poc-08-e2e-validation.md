---
title: "E2E validation: build, lint, and migrations smoke test"
type: infra
priority: P0
branch: feature/e2e-validation
---

## Objective
Run the full acceptance validation pass for the POC: `yarn build` clean, `yarn lint` clean, drizzle migrations applied on Supabase (all 6 tables visible), storage buckets created, and the critical user journey (sign in → publish → read → comment) exercised end-to-end.

## Context
- All 7 POC tasks are now implemented; this task closes out the POC validation phase
- Several acceptance criteria remain open across tasks: `db-1` through `db-9` (migrations applied), `auth-4` (session persists), `lei-6` (CORS), `home-1` (SSR in view-source)
- `yarn build` may have TypeScript or import errors introduced during implementation
- Drizzle migrations in `drizzle/` (0000–0004) need to be applied via `yarn drizzle:migrate`
- `supabase` directory may need init: `npx supabase@latest link --project-ref <ref>`

## Steps
1. Run `yarn lint && yarn build` — fix all TypeScript errors and ESLint warnings until both pass clean. Common issues: unused imports, missing `await`, incorrect Supabase client usage, `select('*')` crossing RSC boundary.
2. Apply Drizzle migrations: `DATABASE_URL_UNPOOLED=<session-uri> yarn drizzle:migrate` — verify 6 tables (`users`, `scripts`, `script_files`, `audio_files`, `comments`, `ratings`) visible in Supabase dashboard with correct columns and FK constraints.
3. Smoke-test the critical user journey in `yarn dev`: sign in with Google → publish a PDF script → navigate to `/` and verify the script appears → open the script reader → add a comment on page 1 → verify comment appears in sidebar.

## Acceptance criterion
`yarn build` exits with code 0; `yarn lint` exits with code 0; all 6 tables visible in Supabase; comment created in smoke test appears in DB.

## Artifacts
- No new files — fixes applied across existing files as needed
- `.agents/poc-context.json` acceptance items updated to `done: true`
