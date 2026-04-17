# poc-03-auth — Archived

**Original title:** [Auth] - Autenticação completa e fluxos de sessão

## What was done
Full Supabase Auth integration via `@supabase/ssr`: OAuth callback route (`app/auth/callback/route.ts`) exchanges code for session and upserts user to `users` table. Login page (`app/auth/login/page.tsx`) uses Google OAuth via `GoogleAuthButton`. Session middleware (`proxy.ts` + `lib/supabase/proxy.ts`) refreshes tokens on all routes. Protected route group `app/(authenticated)/layout.tsx` redirects unauthenticated users. `usersRouter` in `server/api/users.ts` handles `getProfile`, `updateProfile`, `upsertFromAuth`. Auth uses only `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — no service role key in auth flows.

## Relevant paths
- `app/auth/login/page.tsx`
- `app/auth/callback/route.ts`
- `proxy.ts`
- `lib/supabase/proxy.ts`
- `app/(authenticated)/layout.tsx`
- `server/api/users.ts`
